const path = require('path');
const fs = require('fs');
const { log } = require('./log');
const { makeRequest } = require('./request');
const { showPM2ProcessInfo } = require('./pm2');
const { getMiliseconds } = require('./time');
const { getBytes, getHumanReadableValue } = require('./memory');
const { checkEditorExists, openFile } = require('./editor');

const homedir = require('os').homedir();
const configdir = '.pm2-supervisor';
const rulesFileName = 'rules.json';
const filePath = path.resolve(homedir, configdir, rulesFileName);
const rulesTypes = ['httpTimeout', 'httpStatus', 'cpuUsage', 'memoryUsage'];
const allowedHttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

exports.getRules = function getRules() {
  try {
    const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log('rules.json parsed successfully');
    return requests || [];
  } catch (e) {
    log("rules.json file can't be parsed as JSON", 'error');
    throw e;
  }
};

exports.checkRulesFileExists = function checkRulesFileExists() {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (e) {
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
  if (rule.options.interval) {
    try {
      getMiliseconds(rule.options.interval);
    } catch (e) {
      throw new Error(`Invalid interval. ${e.message}`);
    }
  }
  if (rule.options.skip) {
    if (typeof rule.options.skip !== 'number') {
      throw new Error('Expected skip to be a number.');
    }
    if (rule.options.skip < 1) {
      throw new Error('Skip must be greater than zero');
    }
  }
  switch (rule.type) {
    case 'httpStatus': {
      checkCommonHttpParams(rule.options);
      if (!rule.options.statusCode) throw new Error('Expected status code');
      if (typeof rule.options.statusCode !== 'number') {
        throw new Error('Expected status code to be a number.');
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
    case 'cpuUsage': {
      if (!rule.options.usage) {
        throw new Error('Expected usage property.');
      }
      if (typeof rule.options.usage !== 'number') {
        throw new Error('Expected usage to be a number.');
      }
      if (rule.options.usage < 0) {
        throw new Error("Expected usage cant't be negative.");
      }
      break;
    }
    case 'memoryUsage': {
      if (!rule.options.usage) {
        throw new Error('Expected usage property.');
      }
      try {
        getBytes(rule.options.usage);
      } catch (e) {
        throw new Error(`Invalid usage value. ${e.message}`);
      }
    }
  }
};

function checkCommonHttpParams(options) {
  if (!options.method) throw new Error('Expected method.');
  if (!allowedHttpMethods.includes(options.method)) throw new Error('Unexpected HTTP method');
  if (!options.url) throw new Error('Expected url.');
  try {
    new URL(options.url);
  } catch (e) {
    throw new Error('Invalid url.');
  }
  if (options.query) {
    if (typeof options.query !== 'object' || Array.isArray(options.query)) {
      throw new Error('Invalid query. Must be an object.');
    }
  }
  if (options.body) {
    if (typeof options.body !== 'object') {
      throw new Error('Invalid body. Must be an object.');
    }
  }
  if (options.headers) {
    if (typeof options.headers !== 'object' || Array.isArray(options.headers)) {
      throw new Error('Invalid headers. Must be an object.');
    }
  }
};

exports.printRules = function printRules() {
  console.log(fs.readFileSync(filePath, 'utf8'));
};

exports.openRulesInSysEditor = function openRulesInSysEditor() {
  const editors = ['code', 'notepad++', 'notepad', 'mcedit', 'nano', 'vim'];
  for (const editor of editors) {
    if (checkEditorExists(editor)) return openFile(editor, filePath);
  }
};

exports.createEmptyRulesFile = function createEmptyRulesFile() {
  fs.mkdirSync(path.resolve(homedir, configdir));
  fs.writeFileSync(filePath, '[]');
};

exports.executeRule = async function executeRule(rule) {
  try {
    switch (rule.type) {
      case 'httpStatus': {
        try {
          const { statusCode } = await makeRequest(rule.options);
          if (statusCode !== rule.options.statusCode) {
            log(`httpStatus: got ${statusCode} status, expected ${rule.options.statusCode}`);
            return { name: rule.serviceName, matched: true };
          }
          return { name: rule.serviceName, matched: false };
        } catch (e) {
          log(`httpStatus: got ${e.message} error`);
          return { name: rule.serviceName, matched: true };
        }
      }
      case 'httpTimeout': {
        try {
          await makeRequest(rule.options);
        } catch (e) {
          if(e.name === 'RequestTimeout'){
            log(`httpTimeout: got ${e.message} error`);
            return { name: rule.serviceName, matched: true };
          }
          return { name: rule.serviceName, matched: false };
        }
        return { name: rule.serviceName, matched: false };
      }
      case 'memoryUsage': {
        const processesInfo = await showPM2ProcessInfo(rule.serviceName);
        for (const processInfo of processesInfo) {
          if(processInfo.monit.memory > getBytes(rule.options.usage)){
            log(`memoryUsage: fixed memory usage at ${getHumanReadableValue(processInfo.monit.memory)}`);
            return { name: processInfo.pm_id, matched: true };
          }
          return { name: processInfo.pm_id, matched: false };
        }
      }
      case 'cpuUsage': {
        const processesInfo = await showPM2ProcessInfo(rule.serviceName);
        for (const processInfo of processesInfo) {
          if(processInfo.monit.cpu > rule.options.usage){
            log(`cpuUsage: fixed cpu usage at ${processInfo.monit.cpu}`);
            return { name: processInfo.pm_id, matched: true };
          }
          return { name: processInfo.pm_id, matched: false };
        }
      }
    }
  } catch (e) {
    log(`the rule "${rule.type}" for the service "${rule.serviceName}" errored. ${e.message}`, 'error');
  }
};
