const exec = require('child_process').exec;
const net = require('net');

class StatusChecker {

    constructor(services, cacheInterval) {
        this.cacheInterval = cacheInterval;
        this.services = services;
        this.lastFetched = 0;
        this.value = {};
    }

    get(){
        if(time() - this.lastFetched > this.cacheInterval){
            this.update();
            this.lastFetched = time();
        }
        return this.value;
    }

    update(){
        exec('docker ps -a --format=\'{{json .}}\'', (err, stdout, stderr) => {
            if(err){
                this.value = {}
            } else {
                let jsonStr = stdout.split('}').join('},');
                jsonStr = '[' + jsonStr.substring(0, jsonStr.lastIndexOf(',')) + ']';
                const containers = JSON.parse(jsonStr);
                const output = this.services;
                let servicesPinged = 0;
                output.forEach((service) => {
                    service.container = containers.find(x => x.Names === service.containerName);
                    let target = service.target.replace(/.*\/\//, '');
                    let parts = target.split(':');

                    let port = parseInt(parts[1], 10);
                    let host = parts[0];
                    let socket = net.connect(port, host);

                    let timer = setTimeout(() => {
                        service.reachable = false;
                        servicesPinged++;
                        if (servicesPinged === this.services.length) {
                            this.value = output;
                        }
                    }, 500);
                    socket.on('error', () => {
                        service.reachable = false;
                        servicesPinged++;
                        clearInterval(timer);
                        if (servicesPinged === this.services.length) {
                            this.value = output;
                        }
                    });
                    socket.on('connect', () => {
                        service.reachable = true;
                        servicesPinged++;
                        clearInterval(timer);
                        if (servicesPinged === this.services.length) {
                            this.value = output;
                        }
                    });
                });

            }
        });
    }
}

function time(){
    return Math.floor(Date.now() / 1000);
}

module.exports = StatusChecker;