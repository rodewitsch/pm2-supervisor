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
    const url = new URL(options.url);
    const isHTTPS = url.protocol === 'https:';
    const defaultPort = isHTTPS ? 443 : 80;
    const requestModule = isHTTPS ? https : http;
    const hostname = url.hostname;
    const port = url.port || defaultPort;
    const query = new URLSearchParams(options.query);
    const path = url.pathname + '?' + query;
    const data = options.body ? JSON.stringify(options.body) : null;
    const headers = {
      ...(options.body ? { 'Content-Length': data.length } : {}),
      ...options.headers,
    };
    const req = requestModule.request(
      {
        hostname,
        port,
        path,
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
