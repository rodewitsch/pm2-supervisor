<h1>pm2-supervisor</h1>

[![GitHub license](https://img.shields.io/github/license/rodewitsch/pm2-reload)](https://github.com/rodewitsch/pm2-reload/blob/main/LICENSE)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/rodewitsch/pm2-supervisor.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/rodewitsch/pm2-supervisor/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/rodewitsch/pm2-supervisor.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/rodewitsch/pm2-supervisor/context:javascript)
![npm](https://img.shields.io/npm/v/@rodewitsch/pm2-supervisor)
![npm](https://img.shields.io/npm/dy/@rodewitsch/pm2-supervisor)

<p>A utility for periodically checking the availability of services launched by the pm2 process manager. Allows you to restart services in the event of a case described in the list of restart rules.</p>

<hr>
<h2>Installation pm2-supervisor</h2>
<hr>

With NPM:

```bash
npm i -g @rodewitsch/pm2-supervisor
```

With Yarn:

```bash
yarn global add @rodewitsch/pm2-supervisor
```

With NPM from Github:

```bash
npm i -g git+https://github.com/rodewitsch/pm2-supervisor.git
```

<hr>
<h2>Start with systemd</h2>
<hr>

<pre>
[Unit]
Description=pm2-supervisor
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=pm2-supervisor
Restart=on-failure

[Install]
WantedBy=multi-user.target
</pre>


<hr>
<h2>Usage commands</h2>
<hr>
<table>
  <tr>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>pm2-supervisor -h, --help</td>
    <td>Show help</td>
  </tr>
  <tr>
    <td>pm2-supervisor -v, --version</td>
    <td>Show version</td>
  </tr>
  <tr>
    <td>pm2-supervisor -t, --test</td>
    <td>Test rules config</td>
  </tr>
  <tr>
    <td>pm2-supervisor -e, --edit</td>
    <td>Open editor with rules</td>
  </tr>
  <tr>
    <td>pm2-supervisor -l, --list
    <td>Print rules</td>
  </tr>
  <tr>
    <td>pm2-supervisor</td>
    <td>Execute rules</td>
  </tr>
</table>

<hr>
<h2>Check types</h2>
<hr>
 <ul>
    <li>
        <a href="#httpStatus">httpStatus</a>
    </li>
    <li>
        <a href="#httpTimeout">httpTimeout</a>
    </li>
    <li>
        <a href="#cpuUsage">cpuUsage</a>
    </li>
    <li>
        <a href="#memoryUsage">memoryUsage</a>
    </li>
 </ul>

<article>
    <h3 id="httpStatus"><strong>httpStatus</strong></h3>
    <h4>Description</h4>
    <p>Perform an http request and restart the specified process when response code doesn't match the status code property of rule.</p>
    <h4>Rule options:</h4>
    <ul>
        <li>interval - (optional) executes the rule every specified time value</li>
        <li>skip - (optional) number of skips before restarting the process</li>
        <li>method - http method</li>
        <li>url - url</li>
        <li>body - (optional) http request body</li>
        <li>headers - (optional) http request headers</li>
        <li>statusCode - expected response code</li>
    </ul>
    <p>GET example:</p>
    <span>Check every second and if the endpoint's statusCode response does not match 200, restart the process named "server"..</span>
    <pre>{
    "serviceName": "server",
    "type": "httpStatus",
    "options": {
      "interval": "1s",
      "method": "GET",
      "url": "http://localhost:3000/502",
      "statusCode": 200
    }
  }</pre>
      <p>POST example:</p>
    <pre>  {
    "serviceName": "server",
    "type": "httpStatus",
    "options": {
      "interval": "1s",
      "method": "POST",
      "url": "http://localhost:3000/200",
      "body": [{ "somePayload": 1 }],
      "headers": { "Content-Type": "application/json" },
      "statusCode": 200
    }
  }</pre>
</article>

<article>
    <h3 id="httpTimeout"><strong>httpTimeout</strong></h3>
    <h4>Description</h4>
    <p>Perform an http request and restart the specified process when response doesn't received during the specified time.</p>
    <h4>Rule options:</h4>
    <ul>
        <li>interval - (optional) executes a rule every specified time value (syntax: 1s, 2m, 3h)</li>
        <li>skip - (optional) number of skips before restarting the process</li>
        <li>method - http method</li>
        <li>url - url</li>
        <li>body - (optional) http request body</li>
        <li>headers - (optional) http request headers</li>
        <li>timeout - request timeout</li>
    </ul>
    <p>GET example:</p>
    <span>Check every five seconds and if answer does not received during 1 minute, restart the process.</span>
    <pre>{
    "serviceName": "server",
    "type": "httpTimeout",
    "options": {
      "interval": "5s",
      "method": "GET",
      "url": "http://localhost:3000/200",
      "query": { "sleep": 5000 },
      "timeout": "1m"
    }
  }</pre>
</article>

<article>
    <h3 id="cpuUsage"><strong>cpuUsage</strong></h3>
    <h4>Description text</h4>
    <p>Restart a process when cpu usage is more than setted.</p>
    <h4>Rule options:</h4>
    <ul>
        <li>interval - (optional) executes a rule every specified time value (syntax: 1s, 2m, 3h)</li>
        <li>skip - (optional) number of skips before restarting the process</li>
        <li>usage - usage value</li>
    </ul>
    <p>Example:</p>
    <span>Check every 5 seconds and if some process with a specified name uses more cpu than written in a usage property, restart the process.</span>
    <pre>{
    "serviceName": "server",
    "type": "cpuUsage",
    "options": {
      "interval": "5s",
      "skip": 5,
      "usage": 80
    }
  }</pre>
</article>

<article>
    <h3 id="memoryUsage"><strong>memoryUsage</strong></h3>
    <h4>Description text</h4>
    <p>Restart a process when memory usage is more than setted.</p>
    <h4>Rule options:</h4>
    <ul>
        <li>interval - (optional) executes a rule every specified time value (syntax: 1s, 2m, 3h)</li>
        <li>skip - (optional) number of skips before restarting the process</li>
        <li>usage - memory usage value (syntax: 1kb, 2 mb, 3gb)</li>
    </ul>
    <p>Example:</p>
    <span>Check every 5 seconds and if any process with the specified name is using more memory than the usage property specified, restart the process.</span>
    <pre>{
    "serviceName": "server",
    "type": "memoryUsage",
    "options": {
      "interval": "5s",
      "skip": 5,
      "usage": "36mb"
    }
  }</pre>
</article>
