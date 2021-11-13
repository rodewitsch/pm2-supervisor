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

exports.pm2Reload = async function pm2Reload(serviceName) {
  return new Promise((resolve, reject) => {
    exec(
      `pm2 reload ${serviceName}`,
      { encoding: 'utf8', stdio: 'pipe' },
      (error, stdout) => {
        if (error) {
          log(error.message.replace(/[\r\n]/g, ' ').trim(), 'error');
          return reject(error);
        }
        log(`the service "${serviceName}" reloaded successfully`);
        return resolve(stdout);
      }
    );
  });
};
