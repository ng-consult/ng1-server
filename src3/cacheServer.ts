import * as nodeurl from 'url';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as http from 'http';
const request = require('request');
import * as bunyan from 'bunyan';
import {RedisUrlCache} from 'redis-url-cache';
import RedisStorageConfig = RedisUrlCache.RedisStorageConfig;
import CacheEngineCB = RedisUrlCache.CacheEngineCB;
import Instance = RedisUrlCache.Instance;
import CacheCB = RedisUrlCache.CacheCB;
import {IServerConfig, IRequestResult, IHeaders} from "./interfaces";
import ServerLog from './serverLog';

const debug = require('debug')('ngServer-CacheServer');


export default class CacheServer {

    static cacheEngine:CacheEngineCB;

    private serverConfig:IServerConfig;

    private cacheRules;

    private instanceName: string = 'SLIMER_REST';

    private logger: bunyan.Logger;

    //constructor(private defaultDomain: string, private instanceName: string, private redisConfig: RedisStorageConfig, private port: number) {
    constructor(private configDir) {
        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }

        const serverConfigpath:string = path.join(configDir, 'serverConfig.js');
        this.serverConfig = require(`${serverConfigpath}`);

        const cacheRulesPath:string = path.join(configDir, 'slimerRestCacheRules.js');
        this.cacheRules = require(`${cacheRulesPath}`);

        ServerLog.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);

        this.logger = ServerLog.Log.child({
            script: 'FFF'
        });
    }

    private connectRedisUrlCache(cb:Function) {
        const instance = new Instance(this.instanceName, this.serverConfig.redisConfig, {}, (err) => {
            if (err) return cb(err);

            CacheServer.cacheEngine = new CacheEngineCB(this.serverConfig.domain, instance);
            cb(null);
        })
    }

    public start() {
        const httpServer = http.createServer(this.urlServer);

        this.connectRedisUrlCache(err => {
            if (err) {
                this.logger.error({err: err}, 'Error connecting with redis-url-cache');
                throw new Error(err);
            }

            httpServer.listen(this.serverConfig.socketServers.fff.port);

            httpServer.on('clientError', (err, socket) => {
                debug('On Client Error: ', err);
                this.logger.error({err: err, socket: socket}, 'Socket error');
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            });

            this.logger.warn('Cache Server launched');
            console.log('CacheSever ', this.instanceName, 'Launched');
        });

    }

    private urlServer = (request:http.IncomingMessage, response:http.ServerResponse) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Request-Method', '*');
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        if(typeof request.headers['access-control-request-headers'] !== 'undefined') {
            response.setHeader('Access-Control-Allow-Headers', request.headers['access-control-request-headers']);
        }
        if ( request.method === 'OPTION' || request.method === 'OPTIONS' ) {
            //debug('option call for ', request.url);
            //debug(request.headers);
            //debug(request);
            response.writeHead(200);
            response.end();
            return;
        } else {
            this.logger.info({url: nodeurl.parse(request.url), method: request.method}, 'New request');
            //debug('requesting ', request.method, request.url);
        }

        const cacheServerRequest = new CacheServerRequest(this.serverConfig, request);

        cacheServerRequest.getIt( (status, headers,content) => {
            var headerKeys = Object.keys(headers);
            response.setHeader('Access-Control-Expose-Headers', headerKeys.join(','));
            response.writeHead(status, headers);
            response.end(content);
        });

    }
}

class CacheServerRequest {

    private url;
    private urlCB: CacheCB;
    private headers;
    private originalURL: string;
    private logger: bunyan.Logger;

    //todo prepend: ")]}',\n" to all JSON responses

    constructor(private serverConfig: IServerConfig, request:http.IncomingMessage) {
        this.url = nodeurl.parse(request.url, true);

        this.logger = ServerLog.Log.child({
            script: 'FFF',
            url: this.url
        });

        try {
            this.urlCB = CacheServer.cacheEngine.url(this.url.query.url);
        }
        catch(e) {
            this.logger.error({e: e}, 'Error executin cacheEngine.url()');
            debug('Error with url: request.url', request.url);
            debug(e);
            throw e;
        }

        if(typeof request.headers['referer'] === 'undefined') {
            const error = new Error('Error - the referer header is not set');

            this.logger.error({ headers: request.headers, err: error});
            throw error;
        }

        const parsedOriginalURL = nodeurl.parse(request.headers['referer']);
        parsedOriginalURL.query = null;
        parsedOriginalURL.path = null;
        parsedOriginalURL.pathname = null;
        parsedOriginalURL.hash = null;
        parsedOriginalURL.search = null;
        this.originalURL = nodeurl.format(parsedOriginalURL);
        this.headers = request.headers;
        delete this.headers['ngreferer'];
        //todo
        //Replicate all the headers from the original request
    }

    getIt(cb: Function) {

        if (this.url.pathname !== '/get' || typeof this.url.query.url === 'undefined') {
            this.logger.warn( 'URL isnot valid' );
            debug(this.url);
            return cb(501, {'Content-Type': 'text/html'}, 'Forbidden');
        }
        this.detectCachingStatus((cachingStatus) => {
            //debug('detectCachingStatus', cachingStatus);

            switch (cachingStatus) {
                case 'ERROR':
                case 'NEVER':
                case 'NOT_CACHED':
                    this.requestURL2(this.headers, (err, result:IRequestResult) => {
                        if(err) {
                            debug(err);
                            this.logger.error({err: err, cachingStatus: cachingStatus, headers: this.headers}, err);
                            return cb(501, {'Content-Type': 'text/html'}, 'Error ' + err);
                        }
                        if(result.content.length === 0) {
                            this.logger.error({cachingStatus: cachingStatus, headers: this.headers}, 'Empty response');
                            return cb(501, {'Content-Type': 'text/html'}, 'Error response is empty' + JSON.stringify(result));
                        }
                        if (cachingStatus !== 'NEVER') {
                            this.urlCB.set(result.content, {
                                status: result.status,
                                url: this.urlCB.getUrl(),
                                domain: this.urlCB.getDomain(),
                                headers: result.headers
                            }, false, (err, setResult) => {
                                if (err) {
                                    //todo log the error
                                    debug(err);
                                    this.logger.error({err: err, cachingStatus: cachingStatus, headers: this.headers}, 'Error storing in redis-url-cache');
                                    return cb(501, {'Content-Type': 'text/html'}, 'Error ' + err);
                                }
                                result.headers['ngServerCached'] = 'yes';
                                return cb(result.status, result.headers, result.content);
                            })
                        } else {
                            result.headers['ngServerCached'] = 'no';
                            return cb(result.status, result.headers, result.content);
                        }
                    });
                    break;
                case 'CACHED':
                    this.urlCB.get((err, content) => {
                        if (err) {
                            //todo log the error
                            debug(err);
                            this.logger.error({err: err, cachingStatus: cachingStatus, headers: this.headers}, "error retrieve content from redis-url-cache");
                            return cb(501, {'Content-Type': 'text/html'}, 'Error ' + err);

                        }
                        content.extra.headers['ngServerCached'] = 'yes';
                        return cb(content.extra.status, content.extra.headers, content.content);

                    });
            }

        });
    }


    private requestURL2(headers: Object, cb: Function) {

        // this section newheaders should be removed
        const newHeaders = {};
        newHeaders['origin'] = this.originalURL;
        newHeaders['user-agent'] = headers['user-agent'] ? headers['user-agent'] : 'Super User Agent';
        newHeaders['accept-encoding'] = headers['accept-encoding'] ? headers['accept-encoding'] : 'gzip, deflate, sdch';
        if(headers['cookie']) newHeaders['cookie'] = headers['cookie'];

        //debug('requestURL, sending Headers to ', this.url.query.url, JSON.stringify(newHeaders));

        const parsedURL = nodeurl.parse(this.url.query.url);
        const url = parsedURL.host === null ? this.serverConfig.domain + this.url.query.url : this.url.query.url;

        request( {
            url: url,
            headers: newHeaders
        },  (err, response, body) => {
            if (err) {
                //todo log error
                this.logger.error({err: err, url: url, headers: newHeaders, response: response}, 'Error getting the url');
                return cb(err);
            }
            if(body.length === 0) {
                this.logger.error({err: err, url: url, headers: newHeaders, response: response}, 'Empty body');
                return cb('no response: ' + JSON.stringify(response.headers));
            }
            //debug('requestURL, response headers : ', JSON.stringify(response.headers));
            const data:IRequestResult = {
                status: response.statusCode,
                content: body,
                headers: this.extractHeaders(response.headers)
            };
            cb(null, data);
        });
    }

    private extractHeaders(receivedHeaders):IHeaders {
        const headers = {};
        const headersToExtract = [
            'access-control-allow-origin',
            'cache-control',
            'content-encoding',
            'content-length',
            'content-type',
            'etag',
            'expires',
            'date',
            'last-modified'
        ];

        let key, keys = Object.keys(receivedHeaders);
        let n = keys.length - 1;
        let newReceivedHeaders = {};
        keys.forEach( (key) => {
            newReceivedHeaders[key.toLowerCase()] = receivedHeaders[key];
        });
        headersToExtract.forEach(name => {
            if (newReceivedHeaders[name]) {
                headers[name] = newReceivedHeaders[name];
            }
        });
        headers['access-control-allow-origin'] = '*';
        return headers;
    }

    private detectCachingStatus(cb:Function) {
        this.urlCB.has((err, isCached) => {
            if (err) {
                this.logger.error({err: err}, 'Error has()');
                return cb('ERROR');
            }
            if (this.urlCB.getCategory() === 'never') {
                return cb('NEVER');
            }
            if (isCached) {
                return cb('CACHED');
            } else {
                return cb('NOT_CACHED');
            }
        });
    }

}
