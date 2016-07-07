/**
 * Created by antoine on 07/07/16.
 */
var Validator = require('jsonschema').Validator;

module.export  = function(config) {
    if (!config) {
        console.error(config);
        throw new Error("Config object not provided " + config);
    }
    
    var v = new Validator();
    
    var pathSchema = {
        id: "/Path",
        type: "object",
        properties: {
            log: {type: "string"},
            pid: {type: "string"},
            html_views: {
                type: "array",
                items: {"type": "string"}
            },
            statics: {
                type: "array",
                items: {"type": "string"}
            },
            scripts: {
                type: "array",
                items: {"type": "string"}
            }
        }
    };

    var serverSchema = {
        id: "/Server",
        type: "object",
        properties: {
            type:  {
                "enum": [
                    "value",
                    {
                        "server": "server",
                        "client": "client"
                    }
                ]
            },
            port: {type: "integer"},
            pre_render:{type: "boolean"},
            bootstrap_selector: {type: "string"},
            index_html: {type: "string"},
            doc: {type: "string"}
        }
    };

    var cacheRuleMaxAgeSchema = {
        "id": "/CacheRuleMaxAge",
        "type": "object",
        "properties": {
            "regex": {"type": "string"},
            "maxAge": {"type": "integer"}
        }
    };

    var cacheRuleAggressiveSchema = {
        id: "/CacheRuleAggressive",
        type: "object",
        properties: {
            "regex": {type: "string"}
        }
    };

    var cacheRuleTimestampSchema = {
        id: "/CacheRuleTimestamp",
        type: "object",
        properties: {
            "regex": {type: "string"},
            timestamp: {type: "function"}
        }
    };

    var cacheSchema = {
        "id": "/Cache",
        "type": "object",
        "properties": {
            type: {
                enum: {
                    value: {
                        none: "none",
                        file: "file"
                    }
                }
            },
            fileDir: { type: "string"},
            cacheMaxAge: {
                type: "array",
                "$ref": "/CacheRuleMaxAge"
            },
            cacheAlways: {
                type: "array",
                "$ref": "/CacheRuleAggressive"
            },

            cacheNever: {
                type: "array",
                "$ref": "/CacheRuleAggressive"
            },
            cacheTimestamp: {
                type: "array",
                "$ref": "/CacheRuleTimestamp"
            }
        }
    };


    var configSchema = {
        "id": "/Config",
        "type": "object",
        "properties": {
            "path": {"$ref": "/Path"},
            "server": { "$ref": "/Server"},
            "cache": { "$ref": "/Cache"}
        }
    };

    v.addSchema(pathSchema, '/Path');
    v.addSchema(serverSchema, '/Server');
    v.addSchema(cacheRuleMaxAgeSchema, '/CacheRuleMaxAge');
    v.addSchema(cacheRuleAggressiveSchema, '/CacheRuleAggressive');
    v.addSchema(cacheRuleTimestampSchema, '/cacheRuleTimestamp');
    v.addSchema(cacheSchema, '/Cache');


    return v.validate(config, configSchema);
};
