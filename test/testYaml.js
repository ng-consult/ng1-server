const yaml = require('js-yaml');
const fs = require('fs-extra');
const fileContent = fs.readFileSync('./../bin/configYaml/serverCacheRules.yml', 'utf-8');

const data1 = yaml.load(fileContent , {
    schema: yaml.DEFAULT_FULL_SCHEMA
});

console.log(typeof data1.maxAge[0].domain);

const data2 = yaml.safeLoad(fileContent, {
    schema: yaml.DEFAULT_FULL_SCHEMA
});
console.log(typeof data2.maxAge[0].domain);