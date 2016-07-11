/**
 * Created by antoine on 07/07/16.
 */
var Validator = require('jsonschema').Validator;

module.exports  = function(config) {
    if (!config) {
        console.error(config);
        throw new Error("Config object not provided " + config);
    }
    
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
                "items": {"type": "string"}
            }
        }
    };


    var cacheRuleMaxAgeSchema = {
        "id": "/CacheRuleMaxAge",
        "type": "object",
        "properties": {
            "regex": {"type": "object"},
            "maxAge": {"type": "integer"}
        }
    };

    var cacheRuleAggressiveSchema = {
        id: "/CacheRuleAggressive",
        type: "object",
        properties: {
            "regex": {type: "object"}
        }
    };

    var cacheRuleTimestampSchema = {
        id: "/CacheRuleTimestamp",
        type: "object",
        properties: {
            "regex": {type: "object"},
            timestamp: {type: "function"}
        }
    };

    var cacheSchema = {
        "id": "/Cache",
        "type": "object",
        "properties": {
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
        }
    };


    var configSchema = {
        "id": "/Config",
        "type": "object",
        "properties": {
            "name": { "type": "string"},
            "log": {"type": "string"},
            "server": { "$ref": "/Server"},
            "cache": { "$ref": "/Cache"}
        }
    };

    v.addSchema(serverSchema, '/Server');
    v.addSchema(cacheRuleMaxAgeSchema, '/CacheRuleMaxAge');
    v.addSchema(cacheRuleAggressiveSchema, '/CacheRuleAggressive');
    v.addSchema(cacheRuleTimestampSchema, '/cacheRuleTimestamp');
    v.addSchema(cacheSchema, '/Cache');


    return v.validate(config, configSchema);
};
