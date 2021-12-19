const fs = require('fs');
const path = require('path');
const { getRules, checkRulesFileExists, validateRules, printRules, openRulesInSysEditor } = require('./rules');

exports.processingArguments = function processingArguments(args) {
  for (const arg of args) {
    switch (arg) {
      default:
      case '--help':
      case '-h': {
        return printHelp();
      }
      case '--version':
      case '-v': {
        return printVersion();
      }
      case '--list':
      case '-l': {
        return printRules();
      }
      case '--edit':
      case '-e': {
        return openRulesInSysEditor();
      }
      case '--test':
      case '-t': {
        if (!checkRulesFileExists()) throw new Error('rules.json file does not exist.');
        const rules = getRules();
        return validateRules(rules);
      }
    }
  }
  return true;
};

function printHelp() {
  console.log(`
    Usage: pm2 [option]

    Options: 

    ${'-h, --help'.padEnd(30)} output usage information
    ${'-v, --version'.padEnd(30)} output the version number
    ${'-l, --list'.padEnd(30)} list specified rules
    ${'-e, --edit'.padEnd(30)} edit specified rules
    ${'-t, --test'.padEnd(30)} check specified rules
  `);
}

function printVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../', 'package.json'), 'utf8')
  );
  console.log(`v.${packageJson.version}`);
}