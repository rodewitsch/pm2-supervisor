const { execSync, spawn } = require('child_process');
const os = require('os');

exports.checkEditorExists = function checkEditorExists(editorName) {
  try {
    const platform = os.platform();
    const checkCommand = platform === 'win32' ? 'where' : 'which';
    execSync(`${checkCommand} ${editorName}`);
    return true;
  } catch (e) {
    return false;
  }
};

exports.openFile = function openFile(editorName, filePath) {
  const platform = os.platform();
  if (platform === 'win32') {
    execSync(`${editorName} ${filePath}`);
  } else {
    spawn(editorName, [filePath], { stdio: 'inherit' });
  }
};
