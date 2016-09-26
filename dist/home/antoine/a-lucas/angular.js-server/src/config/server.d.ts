import { IServerConfig } from './../interfaces';
export default class ServerConfig {
    private serverConfig;
    constructor();
    importConfig(config: IServerConfig): void;
    setDomain: (domain: string) => void;
    setPort: (port: number) => void;
    setTimeout: (timeout: number) => void;
    setDebug: (debug: boolean) => void;
    setBase: (base: string) => void;
    getDomain: () => string;
    getPort: () => number;
    getTimeout: () => number;
    getDebug: () => boolean;
    getBase: () => string;
}
