import { IGeneralConfig, IResponse } from './interfaces';
import EngineConfig from './EngineConfig';
export default class AngularServerRenderer {
    config: EngineConfig;
    private externalResources;
    private static eventEmmiter;
    constructor(config?: IGeneralConfig);
    addExternalresource: (url: string | RegExp, content: string) => void;
    emptyExternalResources: () => void;
    getExternalResources: () => any[];
    private getHTML;
    middleware: (req: any, res: any, next: any) => void;
    private instanciateJSDOM;
    private clearEventEmitterListeners;
    render: (html: string, url: string) => Promise<IResponse>;
}
