const { log } = require('./lib/log');
const { checkRulesFileExists, getRules, executeRule } = require('./lib/rules');
const { checkPM2ModuleExists } = require('./lib/pm2');

const rulesFileName = 'rules.json';

async function main() {
  try {
    log('------------------pm2-supervisor started------------------');
    checkRulesFileExists(rulesFileName);
    checkPM2ModuleExists();

    const rules = getRules(rulesFileName);

    if (rules && rules.length === 0)
      console.log('No rules in ' + rulesFileName);

    // TODO: rules syntax validator

    for (const rule of rules) await executeRule(rule);
    log('------------------pm2-supervisor stopped------------------');
  } catch (err) {
    log('------------------pm2-supervisor errored------------------', 'error');
  }
}

main();
