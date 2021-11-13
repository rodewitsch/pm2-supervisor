const fs = require('fs');
const path = require('path');
const { checkEditorExists, openFile } = require('./editor');

exports.processingArguments = function processingArguments(args) {
  for (const arg of args) {
    switch (arg) {
      default:
      case '--help':
      case '-h': {
        console.log(`help`);
        return false;
      }
      case '--version':
      case '-v': {
        const packagejson = json.parse(
          fs.readfilesync(
            path.resolve(__dirname, '../', 'package.json'),
            'utf8'
          )
        );
        console.log(`v.${packagejson.version}`);
        return false;
      }
      case '--list':
      case '-l': {
        console.log(
          fs.readFileSync(path.resolve(__dirname, '../', 'rules.json'), 'utf8')
        );
        return false;
      }
      case '--edit':
      case '-e': {
        const filePath = path.resolve(__dirname, '../', 'rules.json');
        if (checkEditorExists('code')) return openFile('code', filePath);
        if (checkEditorExists('notepad++')) return openFile('notepad++', filePath);
        if (checkEditorExists('notepad')) return openFile('notepad', filePath);
        if (checkEditorExists('mcedit')) return openFile('mcedit', filePath);
        if (checkEditorExists('nano')) return openFile('nano', filePath);
        if (checkEditorExists('vim')) return openFile('vim', filePath);
        return false;
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
