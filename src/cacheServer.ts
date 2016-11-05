import * as zlib from 'zlib';
import {RedisUrlCache} from 'redis-url-cache';
import RedisStorageConfig = RedisUrlCache.RedisStorageConfig;
import CacheEngineCB = RedisUrlCache.CacheEngineCB;
import Instance = RedisUrlCache.Instance;
import CacheCB = RedisUrlCache.CacheCB;
import {IServerConfig, IRequestResult, IHeaders} from "./interfaces";
import ServerLog from './serverLog';
import Validators from './validators';

const iconv = require('iconv');
import * as nodeurl from 'url';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as http from 'http';
const request = require('request');
import * as bunyan from 'bunyan';
import * as yaml from 'js-yaml';

const debug = require('debug')('ngServer-CacheServer');


class CacheServer {

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

        const serverConfigpath:string = path.join(configDir, 'serverConfig.yml');
        this.serverConfig = yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));

        const cacheRulesPath:string = path.join(configDir, 'slimerRestCacheRules.yml');
        this.cacheRules = Validators.unserializeCacheRules( yaml.load(fs.readFileSync(cacheRulesPath, 'utf8')));

        console.log(this.cacheRules);

        ServerLog.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);

        this.logger = ServerLog.Log.child({
            script: 'CacheServer'
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
            debug('CacheServer ', this.instanceName, 'Launched');
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
            debug('option call for ', request.url);
            debug(request.headers);
            //debug(request);
            //todo forward the option to destination
            response.writeHead(200);
            response.end();
            return;
        } else {
            this.logger.info({url: nodeurl.parse(request.url), method: request.method}, 'New request');
            debug('requesting ', request.method, request.url);
        }

        try {
            const cacheServerRequest = new CacheServerRequest(this.serverConfig, request);

            cacheServerRequest.getIt( (status, headers,content) => {
                var headerKeys = Object.keys(headers);
                response.setHeader('Access-Control-Expose-Headers', headerKeys.join(','));
                response.writeHead(status, headers);
                debug('ACTUALLY GOING TO SEND BACK headers = ', headers);
                response.end(content);
            });
        } catch(e) {
            debug("Excpetion caught");
            response.writeHead(501, {});
            response.end(e.message);
        }

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
            script: 'CacheServer',
            url: this.url
        });

        try {
            this.urlCB = CacheServer.cacheEngine.url(this.url.query.url);
        }
        catch(e) {
            this.logger.error({e: e}, 'Error executin cacheEngine.url()');
            debug('Error with url: request.url', request.url, e);
            throw e;
        }

        if(typeof request.headers['referer'] === 'undefined') {
            const error = new Error('Error - the referer header is not set');

            debug('no referer: headers = ', request.headers);

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
        debug('original headers = ', this.headers);
        delete this.headers['ngreferer'];
        //todo
        //Replicate all the headers from the original request
    }

    getIt(cb: Function) {

        if (this.url.pathname !== '/get' || typeof this.url.query.url === 'undefined') {
            this.logger.warn( 'URL isnot valid' );
            debug('URL is not valid', this.url.pathname, this.url.query);
            return cb(501, {'Content-Type': 'text/html'}, 'Forbidden');
        }
        this.detectCachingStatus((cachingStatus) => {
            //debug('detectCachingStatus', cachingStatus);

            switch (cachingStatus) {
                case 'ERROR':
                case 'NEVER':
                case 'NOT_CACHED':
                    debug('IT IS NOT CACHED');
                    this.requestURL(false, this.headers, (err, result:IRequestResult) => {
                        debug('INSIDE GETIT CB');
                        if(err) {
                            debug('ERROR while requesting ', this.url.query.url, err);
                            this.logger.error({err: err, cachingStatus: cachingStatus, headers: this.headers}, err);
                            return cb(501, {'Content-Type': 'text/html'}, 'Error ' + err);
                        }
                        if(result.content.length === 0) {
                            debug('ERROR while requesting ', this.url.query.url);
                            this.logger.error({cachingStatus: cachingStatus, headers: this.headers}, 'Empty response');
                            return cb(501, {'Content-Type': 'text/html'}, 'Error response is empty' + JSON.stringify(result));
                        }
                        result.headers['caching-status'] = cachingStatus;
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
                    debug('IT IS CACHED');
                    this.urlCB.get((err, content) => {
                        if (err) {
                            //todo log the error
                            debug(err);
                            this.logger.error({err: err, cachingStatus: cachingStatus, headers: this.headers}, "error retrieve content from redis-url-cache");
                            return cb(501, {'Content-Type': 'text/html'}, 'Error ' + err);

                        }
                        content.extra.headers['caching-status'] = cachingStatus;
                        content.extra.headers['ngServerCached'] = 'yes';
                        return cb(content.extra.status, content.extra.headers, content.content);

                    });
            }

        });
    }


    //convert to utf-8
    private decode(headers, body) {
        debug('DECODE CALLED', headers, body.substr(0, 30));

        const re = /charset=([^()<>@,;:\"/[\]?.=\s]*)/i;

        if(headers['content-type']) {
            const charset = re.test(headers['content-type']) ? re.exec(headers['content-type'])[1] : 'utf-8';
            debug('charset detected: ', charset);
            if(charset === 'utf-8') {
                return body;
            }
            var ic = new iconv.Iconv(charset, 'UTF-8');
            var buffer = ic.convert(body);
            return buffer.toString('utf-8');
        }
        throw new Error('content-type is missing');
    }

    private requestURL(binary: boolean ,headers: Object, cb: Function) {

        debug('CALLING REQUEST URL with headers!', headers);



        const newHeaders = {};
        newHeaders['origin'] = this.originalURL;
        newHeaders['user-agent'] = headers['user-agent'] ? headers['user-agent'] : 'Super User Agent';
        if ( typeof newHeaders['accept-encoding'] !== 'undefined') {
            delete newHeaders['accept-encoding'];
            //todo enable GZIP compression - but then find a way to detect if the server supports gzip/deflate before sending the request - and set encoding = null
            //newHeaders['accept-encoding'] = headers['accept-encoding'] ? headers['accept-encoding'] : 'gzip, deflate';
            // to enable Gzip compression, use the following code:

            /**
             *
             *
         req.on('response', (res: http.IncomingMessage) => {
            let output;
             if( res.headers['content-encoding'] === 'gzip' ) {
                const gzip = zlib.createGunzip();
                res.pipe(gzip);
                output = gzip;
            } else if(res.headers['content-encoding'] === 'deflate' ) {
                const deflate = zlib.createDeflate();
                res.pipe(deflate);
                output = deflate;
            }
             else {
                output = res;
            }

             output.on('end', function() {
                debug('on END');
                callback(null, output.toString('UTF-8'));
            });

            const callback = (err: Error, body: string) => {
            debug('callback called');
            if(err) {

                return cb(err, dataResponse);
            }
            dataResponse.content = body;
            dataResponse.headers['content-length'] = body.length + '';
            dataResponse.headers['content-encoding'] = 'identity';
            debug('RESPONSE: ', dataResponse.headers, dataResponse.status, dataResponse.content.substr(0, 30));
            cb(null, dataResponse);
        }
             */
        }
        if(headers['cookie']) newHeaders['cookie'] = headers['cookie'];

        //debug('requestURL, sending Headers to ', this.url.query.url, JSON.stringify(newHeaders));

        const parsedURL = nodeurl.parse(this.url.query.url);
        const url = parsedURL.host === null ? this.serverConfig.domain + this.url.query.url : this.url.query.url;

        debug('GOING TO REQUEST', url, newHeaders)

        request( {
            url: url,
            headers: newHeaders
        }, (err: Error, response: http.IncomingMessage, body: string) => {

            debug('INSIDE CALLBACK');

            if(err) {
                debug('Error caught in request callback', err);
                return cb(err, null);
            }

            debug('body received, body.length  = ', body.length);

            /*try {
                body = this.decode(response.headers, body);
            } catch(e) {
                return cb(e, null);
            }

            debug('after decoding, body.length = ', body.length);
*/
            const dataResponse:IRequestResult = {
                status: response.statusCode,
                content: body,
                headers:  this.extractHeaders(response.headers)
            };

            debug('RESPONSE HEADERS', dataResponse.headers);
            debug('body length = ', body.length);

            cb(null, dataResponse);
        });


    }

    private extractHeaders(receivedHeaders: Object):IHeaders {
        const headers = {};
        const headersToExtract = [
            'access-control-allow-origin',
            'cache-control',
            'content-encoding',
            'content-type',
            'etag',
            'set-cookie',
            'vary',
            'connection',
            'expires',
            'date',
            'last-modified'
        ];

        let keys = Object.keys(receivedHeaders);
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


export = CacheServer;