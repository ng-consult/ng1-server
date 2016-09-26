import { IRenderConfig } from './../interfaces';
export default class RenderConfig {
    private renderConfig;
    constructor();
    importConfig(config: IRenderConfig): void;
    shouldRender(url: string): boolean;
    setStrategy(strategy: string): void;
    addRule(rule: RegExp): void;
    removeRule(rule: RegExp): void;
    getStrategy(): string;
    getRules(): RegExp[];
    hasRule(rule: RegExp): boolean;
}
