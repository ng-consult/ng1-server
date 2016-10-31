import * as path from 'path';
import Spawner from './spawner';
import Bridge_Pool from './bridge_Pool';
import ServerLog from './serverLog';
import {ENUM_RENDER_STATUS, ENUM_CACHE_STATUS} from './MESSAGES';

const debug = require('debug')('ngServer-SlimerProcess');

export default class SlimerProcess {

    private timeout:NodeJS.Timer;

// All this because slimer exit() and stderr don't work well - or at least I don't know how
    private spawner:Spawner;

    private killed:boolean = false;

    constructor(private uid:string) {

        const latestSlimer = path.join(__dirname, './../slimerjs/slimerjs');

        this.spawner = new Spawner(this.uid, latestSlimer);

        debug('LAUNCHING ', path.join(__dirname, 'DDD.js'));
        this.spawner.setParameters([
            path.join(__dirname, 'slimer-page.js'),
            this.uid,
            Bridge_Pool.pool[uid].query.url,
            Bridge_Pool.generateFullURL(Bridge_Pool.serverConfig.socketServers.ccc_2),
            Bridge_Pool.generateFullURL(Bridge_Pool.serverConfig.socketServers.fff),
            Bridge_Pool.pool[uid].query.tmp ? Bridge_Pool.pool[uid].query.tmp : ''
        ]);

        Bridge_Pool.pool[this.uid].pid = this.spawner.launch(false, (data) => {
            debug(data);
        }, (code, signal) => {
            this.onProcessExit(code, signal)
        });

        this.timeout = setTimeout(() => {
            this.kill(1977);
        }, Bridge_Pool.serverConfig.timeout * 1000);
    }

    public kill(code:number) {
        debug('invoking OnProcessExit');
        this.onProcessExit(code, null);
        debug('invoking spaner.exit()');
        ServerLog.Log.child({
            uid: this.uid,
            script: 'Bridge_Pool'
        }).debug({pid: Bridge_Pool.pool[this.uid].pid}, 'killing spawner');
        this.spawner.exit();
        //todo make sure we kill the pid too
    }

    public getSpawner() {
        return this.spawner.info();
    }

    private onProcessExit(code:number, signal:string) {
        debug('onProcessExit called', code, signal, this.uid);
        if (this.killed) return;
        this.killed = true;

        const logger = ServerLog.Log.child({
            uid: this.uid,
            script: 'slimerProcess',
            code: code,
            signal: signal
        });

        logger.debug('onProcessExit called');

        clearTimeout(this.timeout);
        Bridge_Pool.pool[this.uid].benchmark.closed = Date.now();
        if (code === 1977) {
            debug('code 1977 (timeout) caught');
            logger.error('Code 1977 timeout caught');
        }
        if (code !== 0) {
            //if(code === ENUM_SLIMER_ERRORS.WEBAPP_ERROR) {
            //this is handled by Bridge_S2.on(EEE.Error) because I cant get the debug informations for logging here
            //todo log something
            //todo check that the status is consistent with ... Bridge_S2
            //} else {
            logger.error('Spawner exited with an error');
            Bridge_Pool.pool[this.uid].status = ENUM_RENDER_STATUS.ERROR;
            Bridge_Pool.notify_CC_1(this.uid);
            Bridge_Pool.deleteUID(this.uid);
            Bridge_Pool.next();
            //}
        } else {
            if (Bridge_Pool.pool[this.uid].status === ENUM_RENDER_STATUS.HTML) {
                debug('There is HTML, lets next()');
                Bridge_Pool.deleteUID(this.uid);
                Bridge_Pool.next();
            } else {
                debug('there is no html, lets wait');
                Bridge_Pool.pool[this.uid].exit = true;
            }
        }
    }
}