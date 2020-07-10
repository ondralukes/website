const express = require('express');
const spdy = require('spdy');
const fs = require('fs');
const http = require('http');
const https = require('https');
const proxy = require('http-proxy');
const exec = require('child_process').exec;

var key = fs.readFileSync("/var/tls/live/ondralukes.cz/privkey.pem");
var cert = fs.readFileSync("/var/tls/live/ondralukes.cz/fullchain.pem");

var credentials = {key: key, cert: cert};

var app = express();
var proxyServer = proxy.createProxyServer();

const services = [
  { 
   name: 'vault',
   url: '/vault/',
   target: 'http://vault:8080',
   containerName: 'vault'
  },
  {
    name: 'website',
    url: '/',
    target: 'http://website:8080',
    containerName: 'website'
  },
  {
    name: 'proxy',
    url: '',
    target: 'http://proxy:8080',
    containerName: 'proxy'
  }
]

//Redirect http to https
app.use((req, res, next) => {
  if(req.secure){
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
})

app.get('/rawstatus', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  exec('docker ps -a --format=\'{{json .}}\'', (err, stdout, stderr) => {
    if(err){
      res.statusCode = 500;
      res.end();
    } else {
      res.statusCode = 200;
      var jsonStr = stdout.split('}').join('},');
      jsonStr = '[' + jsonStr.substring(0, jsonStr.lastIndexOf(',')) + ']';
      console.log(jsonStr);
      var containers = JSON.parse(jsonStr);
      var output = services;
      var servicesPinged = 0;
      output.forEach((service) => {
        var container = containers.find(x => x.Names == service.containerName);
        service.container = container;
        var req = http.request(service.target,(tmp) => {
          service.reachable = true;
          servicesPinged++;
          if(servicesPinged == services.length){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(output));
            res.end();
          }
        });

        req.on('error', (err) => {
          console.log(err.message);
          service.reachable = false;
          servicesPinged++;
          if(servicesPinged == services.length){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(output));
            res.end();
          }
        });
        req.end();
      });

    }
  });
});

services.forEach((item) => {
  app.all(item.url + '*', (req, res) => {
    console.log("access to " + item.url);
    req.url = req.url.replace(item.url, '/');
    proxyServer.web(req, res, {target: item.target}, (err) => {
      res.statusCode = 500;
      res.write("Proxy error.");
      res.end();
    });
  });
});

var httpServer = http.createServer(app);

spdy.createServer(credentials, app).listen(4443);

httpServer.listen(8080);