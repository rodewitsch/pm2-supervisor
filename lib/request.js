const http = require('http');
const https = require('https');
const { getMiliseconds } = require('./time');

class RequestTimeout extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeout';
  }
}

exports.makeRequest = function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const isHTTPS = options.hostname.includes('https://');
    const defaultPort = isHTTPS ? 443 : 80;
    const requestModule = isHTTPS ? https : http;
    const queryParams = new URLSearchParams(options.queryParams);
    const data = options.body ? JSON.stringify(options.body) : null;
    const headers = {
      ...(options.body ? { 'Content-Length': data.length } : {}),
      ...options.headers,
    };
    const req = requestModule.request(
      {
        hostname: options.hostname.replace(/http:\/\/|https:\/\//g, ''),
        port: options.port || defaultPort,
        path: options.path + '?' + queryParams,
        headers,
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

    if (options.body) req.write(data);

    req.on('error', (error) => reject(error));

    req.end();
  });
};
