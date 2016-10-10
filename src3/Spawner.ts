import * as child_process from 'child_process';
import {ChildProcess} from "child_process";
import {ServerLogger} from './ServerLog';

interface IonCloseFn {
    (code:number, signal:string):void
}

interface IonMessageFn {
    (message: any): void
}

interface ISpanwerLogger {
    logger: ServerLogger,
    type: string
}

export default class Spawner {

    private params:string[] = [];
    private child:ChildProcess;

    constructor(private name:string, private binPath:string, logger: ISpanwerLogger) {
    }

    setParameters(params:string[]) {
        this.params = params;
    }

    launch(relaunchOnError:boolean, onMessage:IonMessageFn, onClose:IonCloseFn) {
        this.child = child_process.spawn(this.binPath, this.params);
        this.child.stdout.setEncoding('utf-8');
        this.child.stderr.setEncoding('utf-8');
        this.child.stdout.on('data', (data) => {
            console.log('stdout: ' + data.toString());
        });
        this.child.stderr.on('data', (data) => {
            ///this.serverLog.log('server', ['Socket server ouputs error'], {err: data.toString()});
            debug('stderr: ' + data.toString());
        });

        this.child.on('message', onMessage);

        this.child.on('error', (err) => {
            //this.serverLog.log('server', ['Socket Server error'], {err: err});
        });

        this.child.on('close', (code, signal) => {
            if (code !== 0) {
                ///this.serverLog.log('server', ['Socket Server crashed.'], {code: code, signal: signal});
                //restart it
                if (relaunchOnError) {
                    debug('relaunching');
                    this.launch(relaunchOnError, onMessage, onClose);
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
        setImmediate(() => {
            return this.child.kill();
        })
    }

    send(data) {
        this.child.send(data);
    }
}


