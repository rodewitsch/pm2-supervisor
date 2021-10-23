const http = require('http');

exports.makeRequest = function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: options.hostname,
        port: options.port || 80,
        path: options.path,
        method: options.method,
      },
      async (res) => resolve(res)
    );

    req.on('error', (error) => reject(error));

    req.end();
  });
};
