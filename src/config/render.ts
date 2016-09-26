import {IRenderConfig} from './../interfaces';
import Helpers from './../Helpers'
import * as dbug from 'debug';
var debug = dbug('angular.js-server');

export default class RenderConfig {
    private renderConfig:IRenderConfig = {
        strategy: 'never',
        rules: []
    };
    constructor() {}

    importConfig(config: IRenderConfig) {
        this.setStrategy(config.strategy);
        config.rules.forEach(rule => {
            this.addRule(rule);
        });
    }

    shouldRender(url: string): boolean {
        let i,regex;
        Helpers.CheckType(url, 'string');
        debug('shouldRender called with url, renderConfig ', url, this.renderConfig)
        switch (this.renderConfig.strategy) {
            case 'never':
                return false;
            case 'always':
                return true;
            case 'include':
                for (i in this.renderConfig.rules) {
                    regex = this.renderConfig.rules[i];
                    if(regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                for (i in this.renderConfig.rules) {
                    regex = this.renderConfig.rules[i];
                    if(regex.test(url)) {
                        return false;
                    }
                }
                return true;
        }
    };

    setStrategy(strategy:string):void{
        Helpers.StringIn(strategy, ['include', 'exclude', 'always', 'never']);
        this.renderConfig.strategy = strategy;
    };

    addRule(rule:RegExp):void{
        Helpers.CheckType(rule, RegExp);
        Helpers.RegexNotIn(rule, this.renderConfig.rules);
        this.renderConfig.rules.push(rule);
    };

    removeRule(rule:RegExp):void{
        Helpers.CheckType(rule, RegExp);
        let index = null;
        for(let i in this.renderConfig.rules) {
            if (Helpers.SameRegex(this.renderConfig.rules[i], rule)) {
                index = i;
            }
        }
        if(index!== null) {
            this.renderConfig.rules.splice(index, 1);
        }
    };

    //getters

    getStrategy():string{
        return this.renderConfig.strategy;
    };

    getRules():RegExp[] {
        return this.renderConfig.rules;
    };

    //helpers
    hasRule (rule: RegExp):boolean {
        Helpers.CheckType(rule, RegExp);
        for(let i in this.renderConfig.rules) {
            if(Helpers.SameRegex(this.renderConfig.rules[i], rule)) {
                return true;
            }
        }
        return false;
    };
}
