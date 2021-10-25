const http = require('http');
const https = require('https');
const { getMiliseconds } = require('./time');

class RequestTimeout extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeout';
  }
};

exports.makeRequest = function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const isHTTPS = options.hostname.includes('https://');
    const defaultPort = isHTTPS ? 443 : 80;
    const requestModule = isHTTPS ? https : http;
    const queryParams = new URLSearchParams(options.queryParams);
    const req = requestModule.request(
      {
        hostname: options.hostname.replace(/http:\/\/|https:\/\//g, ''),
        port: options.port || defaultPort,
        path: options.path + '?' + queryParams,
        method: options.method,
      },
      async (res) => resolve(res)
    );

    if (options.timeout) {
      const timeout = getMiliseconds(options.timeout);
      req.setTimeout(timeout, () => {
        reject(new RequestTimeout('request timeout exceeded'));
        req.end();
      });
    }

    req.on('error', (error) => reject(error));

    req.end();
  });
};
