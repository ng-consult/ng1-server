/**
 * Created by antoine on 07/07/16.
 */
var Validator = require('jsonschema').Validator;

module.exports  = function(config) {
    if (!config) {
        console.error(config);
        throw new Error("Config object not provided " + config);
    }


    var types = Validator.prototype.types;

    types.regex = function testRegex (instance) {
        return instance instanceof RegExp;
    };

    types.file = function(instance) {
        if (typeof instance !== 'string') {
            return false;
        }
        if (instance.length === 0) {
            return false;
        }
        return true;
    };

    var v = new Validator();

    var serverSchema = {
        id: "/Server",
        type: "object",
        properties: {
            domain: {type: "string"},
            port: {type: "integer"},
            timeout: {type: "integer"},
            jsFiles: {
                type: "array",
                items: {type: "file"}
            }
        },
        required: ['domain', 'port', 'timeout', 'jsFiles']
    };

    var renderSchema = {
        id: "/Render",
        type: "object",
        properties: {
            strategy: {type: {
                enum: ["all", "none", "include", "exclude"]
            }},
            rules: {
                type: "array",
                items: {type: "regex"}
            }
        },
        required: ['strategy', 'rules']
    };


    var cacheRuleMaxAgeSchema = {
        "id": "/CacheRuleMaxAge",
        "type": "object",
        "properties": {
            "regex": {"type": "regex"},
            "maxAge": {"type": "integer"}
        },
        required: ['regex', 'maxAge']
    };

    var cacheRuleAggressiveSchema = {
        id: "/CacheRuleAggressive",
        type: "object",
        properties: {
            regex: {type: "regex"}
        }
    };

    var cacheRuleTimestampSchema = {
        id: "/CacheRuleTimestamp",
        type: "object",
        properties: {
            regex: {type: "regex"},
            timestamp: {type: "function"}
        },
        required: ['regex', 'timestamp']
    };

    var cacheSchema = {
        id: "/Cache",
        type: "object",
        properties: {
            type: {
                enum: ["none", "file"]
            },
            fileDir: { type: "string"},
            cacheMaxAge: {
                type: "array",
                items: {"$ref": "/CacheRuleMaxAge"}
            },
            cacheAlways: {
                type: "array",
                items: {"$ref": "/CacheRuleAggressive"}
            },
            cacheNever: {
                type: "array",
                items: {"$ref": "/CacheRuleAggressive"}
            },
            cacheTimestamp: {
                type: "array",
                items: {"$ref": "/CacheRuleTimestamp"}
            }
        },
        required: ['type', 'fileDir', 'cacheAlways', 'cacheNever', 'cacheMaxAge', 'cacheTimestamp']
    };


    var configSchema = {
        "id": "/Config",
        "type": "object",
        "properties": {
            "name": { "type": "string"},
            "log": {"type": "string"},
            "server": { "$ref": "/Server"},
            "cache": { "$ref": "/Cache"},
            "render": { "$ref": "/Render"}
        },
        required: ['name', 'server', 'cache', 'render']
    };

    v.addSchema(renderSchema, '/Render');
    v.addSchema(serverSchema, '/Server');
    v.addSchema(cacheRuleMaxAgeSchema, '/CacheRuleMaxAge');
    v.addSchema(cacheRuleAggressiveSchema, '/CacheRuleAggressive');
    v.addSchema(cacheRuleTimestampSchema, '/cacheRuleTimestamp');
    v.addSchema(cacheSchema, '/Cache');


    return v.validate(config, configSchema);
};
