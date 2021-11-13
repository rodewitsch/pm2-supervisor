const { log } = require('./lib/log');
const { checkRulesFileExists, getRules, executeRule } = require('./lib/rules');
const { checkPM2ModuleExists } = require('./lib/pm2');
const { delay, getMiliseconds } = require('./lib/time');

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

    for (const rule of rules) {
      if (rule.interval) {
        setInterval(() => executeRule(rule), getMiliseconds(rule.interval));
      } else {
        await executeRule(rule);
      }
      await delay(getMiliseconds('5s'));
    }
  } catch (err) {
    log(err.message, 'error');
    log('------------------pm2-supervisor errored------------------', 'error');
  }
}

main();
