#!/usr/bin/env node

const { log } = require('./lib/log');
const { checkPM2ModuleExists, reloadPM2Process } = require('./lib/pm2');
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
    if (!checkPM2ModuleExists()) throw new Error('PM2 module not found');

    const rules = getRules();

    if (rules && rules.length === 0) console.log('No rules in rules file');

    validateRules(rules);

    rules.forEach(async (rule) => {
      do {
        const ruleStatus = await executeRule(rule);
        if (!ruleStatus) continue;
        if (!rule.options.skip && ruleStatus.matched) {
          try {
            await reloadPM2Process(ruleStatus.name);
            log(`the process "${ruleStatus.name}" reloaded successfully`);
          } catch (e) {
            log(e.message.replace(/[\r\n]/g, ' ').trim(), 'error');
          }
        }
        if (rule.options.skip) {
          rule.options.skipped = rule.options.skipped + 1 || 1;
          if (
            ruleStatus.matched &&
            rule.options.skip === rule.options.skipped
          ) {
            try {
              await reloadPM2Process(ruleStatus.name);
              log(`the process "${ruleStatus.name}" reloaded successfully`);
            } catch (e) {
              log(e.message.replace(/[\r\n]/g, ' ').trim(), 'error');
            }
            rule.options.skipped = 1;
          }
          if (!ruleStatus.matched) rule.options.skipped = 1;
        }
        if (rule.options.interval) {
          await delay(getMiliseconds(rule.options.interval));
        }
      } while (rule.options.interval);
    });
  } catch (e) {
    log(e.message, 'error');
    log('------------------pm2-supervisor errored------------------', 'error');
  }
}

main();
