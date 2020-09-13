function init(){
  fetchServices();
  updateTime();
  setInterval(function() {updateTime();}, 500);
}

function fetchServices(){
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      const resp = JSON.parse(xhr.responseText);
      const services = resp.services;
      const cpu = resp.system.cpu * 100;
      const mem = resp.system.mem * 100;
      const count = services.length;
      let reachable = 0;
      services.forEach((service) => {
        if(service.reachable){
          reachable++;
        }
      });
      document.getElementById('serv-status').innerHTML = reachable + ' / ' + count + ' services running.';
      if(reachable !== count){
        document.getElementById('serv-status').classList.add('text-danger');
      } else {
        document.getElementById('serv-status').classList.add('text-success');
      }

      document.getElementById('cpu-load').innerHTML = `CPU load: ${cpu.toFixed(2)}%`;
      if(cpu > 75){
        document.getElementById('cpu-load').classList.add('text-danger');
      } else {
        document.getElementById('cpu-load').classList.add('text-success');
      }

      document.getElementById('mem-usage').innerHTML = `Memory usage: ${mem.toFixed(2)}%`;
      if(mem > 75){
        document.getElementById('mem-usage').classList.add('text-danger');
      } else {
        document.getElementById('mem-usage').classList.add('text-success');
      }
    }
  };
  xhr.open("GET", "/rawstatus", true);
  xhr.send(null);
}

function updateTime(){
  document.getElementById('age').innerHTML = Math.floor((new Date().getTime() - 1081904400000) / 31548960000.0);
  let time = new Date().getTime() - 1283415010000;
  const years = Math.floor(time / 31548960000);
  time -= years * 31548960000;
  const days = Math.floor(time / 86400000);
  document.getElementById('time').innerHTML = years + ' years and ' + days + (days===1?' day':' days');
}
