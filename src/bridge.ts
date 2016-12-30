import Bridge_S1 from './bridge_S1';
import Bridge_S2 from './bridge_S2';
import Bridge_Pool from './bridge_Pool';
import {IServerConfig} from "./interfaces";
import {Cache} from "./cache";
import ServerLog from './serverLog';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';

export default class Bridge {

    private Bridge_S1: Bridge_S1;
    private Bridge_S2: Bridge_S2;
    private serverConfig: IServerConfig;

    constructor(private configDir: string) {

        const serverConfigpath: string = path.join(configDir, 'serverConfig.yml');

        this.serverConfig =  yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));

        Bridge_Pool.init(this.serverConfig);
        ServerLog.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);


    }

    start(cb: Function) : void {
        const logger = ServerLog.Log.child({ script: 'Bridge' });

        const cache = new Cache(this.configDir, (err) => {
            if(err) {
                if(typeof err === 'string') {
                    logger.error(new Error(err));
                } else {
                    logger.error(err);
                }
                throw err;
            };

            try {
                this.Bridge_S1 = new Bridge_S1(this.serverConfig.socketServers.bridge_external.port, cache);

                this.Bridge_S2 = new Bridge_S2(this.serverConfig.socketServers.bridge_internal.port);

                cb();
            } catch(e) {
                logger.error(e);
                cb(e);
            }
        });
    }

    stop(cb: Function): void {
        this.Bridge_S1.stop();
        this.Bridge_S2.stop(cb);
    }

}
