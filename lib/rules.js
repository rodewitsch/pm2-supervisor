const path = require('path');
const fs = require('fs');
const { log } = require('./log');
const { makeRequest } = require('./request');
const { pm2Reload } = require('./pm2');
const { getMiliseconds } = require('./time');

const rulesFileName = 'rules.json';
const filePath = path.resolve(__dirname, '../', rulesFileName);
const rulesTypes = ['httpTimeout', 'httpStatus'];
const allowedHttpMethods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
];

exports.getRules = function getRules() {
  try {
    const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log('rules.json parsed successfully');
    return requests || [];
  } catch (err) {
    log("rules.json file can't be parsed as JSON", 'error');
    throw err;
  }
};

exports.checkRulesFileExists = function checkRulesFileExists() {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
};

exports.validateRules = function validateRules(rules) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!rule.serviceName) {
      throw new Error(`Invalid rule number ${i + 1}. Expected service name.`);
    }
    if (!rule.type) {
      throw new Error(`Invalid rule number ${i + 1}. Expected type.`);
    }
    if (rule.interval) {
      try {
        getMiliseconds(rule.interval);
      } catch (e) {
        throw new Error(
          `Invalid rule number ${i + 1}. Invalid interval. ${e.message}`
        );
      }
    }
    if (!rule.type) {
      throw new Error(`Invalid rule number ${i + 1}. Expected type.`);
    }
    if (!rulesTypes.includes(rule.type)) {
      throw new Error(`Invalid rule number ${i + 1}. Unexpected rule type.`);
    }
    if (!rule.options) {
      throw new Error(`Invalid rule number ${i + 1}. Expected options.`);
    }
    try {
      checkRuleOptions(rule);
    } catch (e) {
      throw new Error(`Invalid rule number ${i + 1}. ${e.message}`);
    }
  }
};

function checkRuleOptions(rule) {
  switch (rule.type) {
    case 'httpStatus': {
      checkCommonHttpParams(rule.options);
      if (!rule.options.statusCode) throw new Error('Expected status code');
      if (typeof rule.options.statusCode !== 'number') {
        throw new Error('Expected status code to be a number');
      }
      if (rule.options.statusCode < 100 || rule.options.statusCode >= 600) {
        throw new Error('Unexpected status code.');
      }
      break;
    }
    case 'httpTimeout': {
      checkCommonHttpParams(rule.options);
      if (!rule.options.timeout) throw new Error('Expected timeout');
      try {
        getMiliseconds(rule.options.timeout);
      } catch (e) {
        throw new Error(`Invalid timeout value. ${e.message}`);
      }
      break;
    }
  }
}

function checkCommonHttpParams(options) {
  if (!options.method) throw new Error('Expected method.');
  if (!allowedHttpMethods.includes(options.method))
    throw new Error('Unexpected HTTP method');
  if (!options.url) throw new Error('Expected url.');
  try {
    new URL(options.url);
  } catch (e) {
    throw new Error('Invalid url.');
  }
  // TODO: query and body validator, maybe headers
}

exports.createEmptyRulesFile = function createEmptyRulesFile() {
  fs.writeFileSync(filePath, '[]');
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
