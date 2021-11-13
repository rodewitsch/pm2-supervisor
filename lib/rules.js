const fs = require('fs');
const { log } = require('./log');
const { makeRequest } = require('./request');
const { pm2Reload } = require('./pm2');

exports.getRules = function getRules(filePath) {
  try {
    const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log('rules.json parsed successfully');
    return requests || [];
  } catch (err) {
    log("rules.json file can't be parsed as JSON", 'error');
    throw err;
  }
};

exports.checkRulesFileExists = function checkRulesFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    log('rules.json file exists');
    return true;
  } catch (err) {
    log('rules.json file does not exist', 'error');
    throw err;
  }
};

exports.executeRule = async function executeRule(rule) {
  try {
    switch (rule.type) {
      case 'httpStatus': {
        try {
          const { statusCode } = await makeRequest(rule.options);
          if (statusCode !== rule.options.statusCode) {
            await pm2Reload(rule.serviceName);
          }
        } catch (err) {
          await pm2Reload(rule.serviceName);
        }
        break;
      }
      case 'httpTimeout': {
        try {
          await makeRequest(rule.options);
        } catch (err) {
          if (err.name === 'RequestTimeout') await pm2Reload(rule.serviceName);
        }
        break;
      }
    }
    log(
      `the rule "${rule.type}" for the service "${rule.serviceName}" executed successfully`
    );
  } catch (err) {
    throw err;
  }
};
