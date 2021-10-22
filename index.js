const http = require('http');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const requestsFileName = 'requests.json';

async function main() {
  log('------------------Running pm2-supervisor------------------');
  checkRequestsFileExists(requestsFileName);
  checkPM2ModuleExists();

  const observedRequests = getRequests(requestsFileName);

  if (!observedRequests || observedRequests.length === 0) {
    console.log('No requests in ' + requestsFileName);
    process.exit(1);
  }

  for (const request of observedRequests) await makeRequest(request);
}

function getRequests(filePath) {
  try {
    const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log('requests.json parsed successfully');
    return requests;
  } catch (err) {
    log("requests.json file can't be parsed as JSON", 'error');
    process.exit(1);
  }
}

function checkRequestsFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    log('requests.json file exists');
    return true;
  } catch (err) {
    log('requests.json file does not exist', 'error');
    process.exit(1);
  }
}

function checkPM2ModuleExists() {
  try {
    const result = execSync(`pm2 -v`, { encoding: 'utf8', stdio: 'pipe' });
    if (!result) throw new Error('empty response from execSync');
    log(`pm2 module exists, version: ${result.trim()}`);
  } catch (err) {
    log(`pm2 utility doesn't exists`, 'error');
    process.exit(1);
  }
}

function log(message, type = 'info') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
  };
  switch (type) {
    case 'info': {
      console.log(colors.green, '[INFO]', colors.reset, message);
      break;
    }
    case 'error': {
      console.log(colors.red, '[ERROR]', colors.reset, message);
      break;
    }
    default: {
      console.log(colors.yellow, '[UNSPECIFIED]', colors.reset, message);
      break;
    }
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: options.hostname,
        port: options.port || 80,
        path: options.path,
        method: options.method,
      },
      (res) => {
        if (res.statusCode === 502) {
          exec(
            `pm2 reload ${options.serviceName}`,
            { encoding: 'utf8', stdio: 'pipe' },
            (error, stdout, stderr) => {
              if (error) {
                log(error.message, 'error');
                process.exit(1);
              }
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
            }
          );
        }
      }
    );

    req.on('error', (error) => {
      console.log(error);
    });

    req.end();
  });
}

main();
