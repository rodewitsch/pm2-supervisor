const { log } = require('./lib/log');
const { checkRulesFileExists, getRules } = require('./lib/rules');
const { checkPM2ModuleExists, pm2Reload } = require('./lib/pm2');
const { makeRequest } = require('./lib/request');
const rulesFileName = 'rules.json';

async function main() {
  try {
    log('------------------pm2-supervisor started------------------');
    checkRulesFileExists(rulesFileName);
    checkPM2ModuleExists();

    const rules = getRules(rulesFileName);

    if (rules && rules.length === 0) console.log('No rules in ' + rulesFileName);

    for (const rule of rules) {
      switch (rule.type) {
        case 'httpStatus': {
          const { statusCode } = await makeRequest(rule);
          if (statusCode === rule.statusCode) await pm2Reload(rule.serviceName);
          break;
        }
      }
    }
    log('------------------pm2-supervisor stopped------------------');
  } catch (err) {
    log('------------------pm2-supervisor errored------------------', 'error');
  }
}

main();
