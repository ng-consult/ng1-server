import * as child_process from 'child_process';
import {ChildProcess} from "child_process";
import ServerLog from './serverLog';

const debug = require('debug')('ngServer-spawner');

interface IonCloseFn {
    (code:number, signal:string):void
}

interface IonStderrFn {
    (message: any): void
}

export default class Spawner {

    private params:string[] = [];
    private child:ChildProcess;

    constructor(private name:string, private binPath:string,  private xvfb: boolean = false) {
        if(xvfb) {
            this.params.push(this.binPath);
            this.binPath = 'xvfb-run';
        }
    }

    info() {
        return {
            params: this.params,
            binPath: this.binPath,
            xvfb: this.xvfb,
            pid: this.child.pid,
            connected: this.child.connected
        }
    }

    setParameters(params:string[]) {
        this.params.push.apply(this.params, params);
        //this.params.unshift('–debug=true')
    }

    //find a way to connunicate with the client on errors

    launch(relaunchOnError:boolean, onStdErr:IonStderrFn, onClose:IonCloseFn) {
        debug('Going to launch', this.binPath, this.params);
        const logger = ServerLog.Log.child(
            {
                uid: this.name,
                script: 'Spawner',
                bin: this.binPath,
                params: this.params
            }
        );
        logger.debug('Launching new process' );

        this.child = child_process.spawn(this.binPath, this.params, {stdio: [0,1,2]});
//xvfb-run

        /*this.child.stdout.setEncoding('utf-8');
        this.child.stderr.setEncoding('utf-8');

        this.child.stderr.on('data', (data) => {
            //console.log('stdout: ' + data.toString());
            debug(this.name, 'stderr.onData', data);
        });

        this.child.stdout.on('data', (data) => {
            //console.log('stdout: ' + data.toString());
            debug(this.name, 'stdout.onData', data);
        });
*/
        this.child.on('error', (err) => {
            //this.serverLog.log('server', ['Socket Server error'], {err: err});
            debug(this.name, 'this.child.onError ',  err);

            logger.debug({err: err}, 'this.child.onError');
        });

        this.child.on('close', (code, signal) => {
            debug(this.name, 'this.child.onClose',  code, signal);

            if (code !== 0) {
                ///this.serverLog.log('server', ['Socket Server crashed.'], {code: code, signal: signal});
                //restart it
                if (relaunchOnError) {
                    debug('relaunching');
                    this.launch(relaunchOnError, onStdErr, onClose);
                }
                onClose(code, signal);
            } else {
                //this.serverLog.log('server', ['Socket Server exited gracefully.'], {code: code, signal: signal});
            }
            onClose(code, null);
        });

        return this.child.pid;
    }

    exit():void {
        debug(this.name, 'exit() invoked');
        setImmediate(() => {
            return this.child.kill();
        })
    }

}