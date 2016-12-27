import Bridge_S1 from './bridge_S1';
import Bridge_S2 from './bridge_S2';
import Bridge_Pool from './bridge_Pool';
import {IServerConfig} from "./interfaces";
import {Cache} from "./cache";
import ServerLog from './serverLog';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';

class Bridge {

    private Bridge_S1: Bridge_S1;
    private Bridge_S2: Bridge_S2;

    constructor(configDir: string) {

        const serverConfigpath: string = path.join(configDir, 'serverConfig.yml');

        const serverConfig: IServerConfig =  yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));

        Bridge_Pool.init(serverConfig);
        ServerLog.initLogs(serverConfig.logBasePath, serverConfig.gelf);

        const logger = ServerLog.Log.child({ script: 'Bridge' });

        const bbb = new Cache(configDir, (err) => {
            if(err) {
                if(typeof err === 'string') {
                    logger.error(new Error(err));
                } else {
                    logger.error(err);
                }
                throw err;
            };

            try {
                this.Bridge_S1 = new Bridge_S1(serverConfig.socketServers.bridge_external.port, bbb);

                this.Bridge_S2 = new Bridge_S2(serverConfig.socketServers.bridge_internal.port);
            } catch(e) {
                logger.error(e);
                throw e;
            }
        });
    }

}


export = Bridge;