import { ILogConfig, ILogConfigData } from './../interfaces';
export default class LogConfig {
    private logConfig;
    private configInstanciated;
    constructor();
    importConfig(config: ILogConfig): void;
    setConfigInstanciated(bool: boolean): void;
    setBasePath: (path: string) => void;
    setDefinition: (log: string, enabled: boolean, stack?: boolean) => void;
    setFileServerName: (name: string) => void;
    getBasePath: () => string;
    getDefinition: (log: string) => ILogConfigData;
    getFileServerName: () => string;
    getLogPath: (log: string) => string;
    getLogServerPath: () => string;
    getConfig: () => ILogConfig;
    log: (...args: any[]) => void;
    initialize(): void;
}
