const { log } = require('./lib/log');
const { checkPM2ModuleExists } = require('./lib/pm2');
const { delay, getMiliseconds } = require('./lib/time');
const { processingArguments } = require('./lib/args');
const {
  checkRulesFileExists,
  getRules,
  executeRule,
  createEmptyRulesFile,
  validateRules,
} = require('./lib/rules');

async function main() {
  try {
    if (!checkRulesFileExists()) {
      log('rules.json is not exists');
      createEmptyRulesFile();
      log('empty rules.json created successfully');
    }
    if (!processingArguments(process.argv.splice(2))) return;
    log('------------------pm2-supervisor started------------------');
    checkPM2ModuleExists();

    const rules = getRules();

    if (rules && rules.length === 0) console.log('No rules in rules file');

    validateRules(rules);

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
