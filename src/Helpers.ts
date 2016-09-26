const debug = require('debug')('angular.js-server');

export default class Helpers {

    /**
     *
     * @param args
     * @constructor
     */
    static Error(...args: any[]): void {
        throw new Error( args.join(', '));
    }

    /**
     *
     * @param r1
     * @param r2
     * @returns {boolean}
     * @constructor
     */
    static SameRegex(r1: RegExp, r2: RegExp): boolean {
        debug('checking if rules are the same', r1, r2);

        if (r1 instanceof RegExp && r2 instanceof RegExp) {
            var props = ["global", "multiline", "ignoreCase", "source"];
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                if (r1[prop] !== r2[prop]) {
                    debug('props diff', prop, r1[prop], r2[prop]);
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 
     * @param input
     * @param type
     * @constructor
     */
    static CheckType( input: any, type: any | any[]) {
        if(typeof input === 'object') {
            if(typeof type === 'string' &&  input.constructor !== type) {
                Helpers.Error('This input is not a valid', type, input, ' type is', input);
            } else if (typeof type === 'array') {
                var valid = false;
                type.forEach((item) =>{
                    if( input.constructor === item) {
                        valid = true;
                    }
                });
                if (!valid) {
                    Helpers.Error(input, 'Doesn\'t match any of these types', type, ' got ', input.constructor);
                }
            }
        } else {
            if(typeof type === 'string' && typeof input !== type) {
                Helpers.Error('This input is not a valid', type, input, ' type is', typeof input);
            } else if (typeof type === 'array') {
                var valid = false;
                type.forEach((item) =>{
                    if( typeof input === item) {
                        valid = true;
                    }
                });
                if (!valid) {
                    Helpers.Error(input, 'Doesn\'t match any of these types', type, ' got ', typeof input);
                }
            }
        }
    }

    static StringIn( input: string, validValues: string[]) {
        Helpers.CheckType(input, 'string');
        if(validValues.length === 0) {
            return;
        }
        var valid = false;
        validValues.forEach((item) => {
            if (item === input) {
                valid = true;
            }
        });
        if(!valid) {
            Helpers.Error(input, 'should match', validValues);
        }
    }

    static RegexNotIn( regex: RegExp, regexes: RegExp[], desc?: string) {
        if (regexes.length === 0) {
            return;
        }
        Helpers.CheckType(regex, RegExp);
        regexes.forEach((item) =>{
            if (Helpers.SameRegex(item, regex)) {
                Helpers.Error(item, ' Is already defined ', desc);
            }
        });
    }
}
