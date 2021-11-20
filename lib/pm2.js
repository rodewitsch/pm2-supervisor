const { execSync, exec } = require('child_process');
const { log } = require('./log');

exports.checkPM2ModuleExists = function checkPM2ModuleExists() {
  try {
    const result = execSync(`pm2 -v`, { encoding: 'utf8', stdio: 'pipe' });
    if (!result) throw new Error('empty response from execSync');
    log(`pm2 module exists, version: ${result.trim()}`);
  } catch (err) {
    log(`pm2 utility doesn't exists`, 'error');
    throw err;
  }
};

exports.reloadPM2Process = async function reloadPM2Process(processName) {
  return new Promise((resolve, reject) => {
    exec(
      `pm2 reload ${processName}`,
      { encoding: 'utf8', stdio: 'pipe' },
      (error, stdout) => {
        if (error) {
          log(error.message.replace(/[\r\n]/g, ' ').trim(), 'error');
          return reject(error);
        }
        log(`the process "${processName}" reloaded successfully`);
        return resolve(stdout);
      }
    );
  });
};

exports.jlistPM2 = async function jlistPM2(keep = '1s') {
  return new Promise((resolve, reject) => {
    exec(`pm2 jlist`, { encoding: 'utf8', stdio: 'pipe' }, (error, stdout) => {
      if (error) {
        log(error.message.replace(/[\r\n]/g, ' ').trim(), 'error');
        return reject(error);
      }
      return resolve(JSON.parse(stdout));
    });
  });
};

exports.showPM2ProcessInfo = async function showPM2ProcessInfo(processName) {
  const allProcessesInfo = await exports.jlistPM2();
  const processesInfo = allProcessesInfo.filter(
    (process) => process.name === processName
  );
  if (!processesInfo.length) {
    throw new Error(`Process ${processName} not found`);
  }
  return processesInfo;
};
