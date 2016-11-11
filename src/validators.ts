import {IServerRenderRule, IServerRenderRuleStr} from './interfaces';
import {CacheEngineCB} from 'redis-url-cache'

class Validators {


    static unserializeServerRules(rules): IServerRenderRule {
        let index,
            regex: RegExp;


        for(index in rules.rules) {
            regex = CacheEngineCB.helpers.unserializeRegex(rules.rules[index]);
            rules.rules[index] = regex;
        }
        return rules;
    }
}


export default Validators;