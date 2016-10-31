import {IServerRenderRule, IServerRenderRuleStr} from './interfaces';
import {RedisUrlCache} from 'redis-url-cache'
import CacheRules = RedisUrlCache.CacheRules;

class Validators {

    static unserializeRegex(input: string): RegExp{
        const match = input.match(new RegExp('^/(.*?)/([gimy]*)$'));
        // sanity check here
        if(match.length === 3 && typeof match[1] === 'string' && typeof match[2] === 'string') {
            return new RegExp(match[1], match[2]);
        }
        throw new Error('The regex string is not a valid regex: ' + input);
    }

    static unserializeCacheRules(rules: CacheRules): CacheRules {
        let index,
            ruleIndex,
            domain,
            regex;

        const types = ['always', 'never', 'maxAge'];

        types.forEach( (type) => {

            for(index in rules[type]) {

                domain = Validators.unserializeRegex(rules[type][index].domain);

                rules[type][index].domain = domain;

                for(ruleIndex in rules[type][index].rules) {

                    regex = Validators.unserializeRegex(rules[type][index].rules[ruleIndex].regex);
                    if(regex !== false) {
                        rules[type][index].rules[ruleIndex].regex = regex;
                    }
                }
            }
        });
        return rules;
    }

    static unserializeServerRules(rules:IServerRenderRuleStr): IServerRenderRule {
        let index,
            regex: RegExp;


        for(index in rules.rules) {
            regex = Validators.unserializeRegex(rules.rules[index]);
            rules.rules[index] = regex;
        }
        return rules;
    }
}


export default Validators;