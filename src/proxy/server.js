const express = require('express');
const spdy = require('spdy');
const fs = require('fs');
const http = require('http');
const proxy = require('http-proxy');

const StatusChecker = require("./status-checker");

const key = fs.readFileSync("/var/tls/live/ondralukes.cz/privkey.pem");
const cert = fs.readFileSync("/var/tls/live/ondralukes.cz/fullchain.pem");

const credentials = {key: key, cert: cert};

const app = express();
const proxyServer = proxy.createProxyServer();

const services = [
  {
    name: 'sfshr-server',
    url: '',
    target: 'sfshr-server:40788',
    containerName: 'sfshr-server',
    proxy: false
  },
  {
    name: 'web-editor',
    url: '/web-editor',
    target: 'http://web-editor:8080',
    containerName: 'web-editor',
    proxy: true
  },
  {
    name: 'vault',
    url: '/vault',
    target: 'http://vault:8080',
    containerName: 'vault',
    proxy: true
  },
  {
    name: 'website',
    url: '',
    target: 'http://website:8080',
    containerName: 'website',
    proxy: true
  },
  {
    name: 'proxy',
    url: '',
    target: 'http://proxy:8080',
    containerName: 'proxy',
    proxy: true
  }
];

for(const service of services){
  const escapedUrl = service.url.replace(/\//g,'\\/');
  //Match with or without trailing slash
  service.regExp = new RegExp(`^(${escapedUrl}\\/|${escapedUrl}$)`);
}

const status = new StatusChecker(services, 10);

//Redirect http to https
app.use((req, res, next) => {
  if(req.secure){
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
})

// Hidden endpoints
const hidden = require('./hidden.js');
if(typeof hidden === 'function') hidden(app);

app.get('/rawstatus', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(await status.get()));
});

services.forEach((item) => {
  if(!item.proxy) return;
  app.all(item.regExp, (req, res) => {
    //Remove service path root
    const newPath = req.path.replace(item.url, '');
    if(newPath === ''){
      let newUrl = req.url;
      if(newUrl.includes('?')){
        newUrl = newUrl.replace('?', '/?');
      } else {
        newUrl += '/';
      }
      res.redirect('https://' + req.headers.host + newUrl);
      return;
    }

    req.url = req.url.replace(req.path, newPath);
    //Redirect request
    proxyServer.web(req, res, {target: item.target}, () => {
      res.statusCode = 500;
      res.write("Proxy error.");
      res.end();
    });
  });
});

const httpServer = http.createServer(app);
const spdyServer = spdy.createServer(credentials, app);

const wsRedirector = (req, socket, head) => {
  for(const service of services){
    if(!service.proxy) continue;
    if(!service.regExp.test(req.url)) continue;
    req.url = req.url.replace(service.url, '');
    proxyServer.ws(req, socket, head, {target: service.target});
    break;
  }
}
httpServer.on('upgrade', wsRedirector);
spdyServer.on('upgrade', wsRedirector);

httpServer.listen(8080);
spdyServer.listen(4443);
