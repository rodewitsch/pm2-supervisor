const fs = require('fs');
const path = require('path');
const { checkEditorExists, openFile } = require('./editor');

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
        // TODO: test rules
        return false;
      }
    }
  }
  return true;
};

function printHelp() {
  console.log(`help`);
}

function printRules() {
  console.log(
    fs.readFileSync(path.resolve(__dirname, '../', 'rules.json'), 'utf8')
  );
}

function printVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../', 'package.json'), 'utf8')
  );
  console.log(`v.${packageJson.version}`);
}

function openRulesInSysEditor() {
  const filePath = path.resolve(__dirname, '../', 'rules.json');
  const editors = ['code', 'notepad++', 'notepad', 'mcedit', 'nano', 'vim'];
  for (const editor of editors) {
    if (checkEditorExists(editor)) return openFile(editor, filePath);
  }
}
