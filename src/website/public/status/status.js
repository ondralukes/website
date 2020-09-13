function fetchServices(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      const resp = JSON.parse(xhr.responseText);
      addServices(resp.services);
      updateSystem(resp.system);
    }
  };
  xhr.open("GET", "/rawstatus", true);
  xhr.send(null);
}

function addServices(services){
  const template = document.getElementById('serv-template');
  services.forEach((service) => {
    const clone = template.cloneNode(true);
    clone.id = 'serv-' + service.name;
    clone.style.display = "";
    clone.getElementsByClassName('serv-name')[0].innerHTML = service.name;
    clone.getElementsByClassName('serv-url')[0].innerHTML = service.url;
    clone.getElementsByClassName('serv-target')[0].innerHTML = service.target;
    const reachableElement = clone.getElementsByClassName('serv-reachable')[0];
    if(service.reachable){
      reachableElement.innerHTML = "Yes";
      reachableElement.classList.add('font-weight-bold');
      reachableElement.classList.add('text-success');
    } else {
      reachableElement.innerHTML = "No";
      reachableElement.classList.add('font-weight-bold');
      reachableElement.classList.add('text-danger');
    }
    const containerElement = clone.getElementsByClassName('serv-container')[0];
    const containerRowTemplate = containerElement.getElementsByClassName('serv-container-row')[0];
    if(typeof service.container !== 'undefined'){
      const keys = Object.keys(service.container);
      keys.forEach((key) => {
        const row = containerRowTemplate.cloneNode(true);
        row.style.display = "";
        row.getElementsByClassName('serv-container-key')[0].innerHTML = key;
        row.getElementsByClassName('serv-container-val')[0].innerHTML = service.container[key];
        containerRowTemplate.parentNode.appendChild(row);
      });
    } else {
      clone.getElementsByClassName('serv-container')[0].innerHTML = "No container.";
    }
    template.parentNode.appendChild(clone);
  });
}
function updateSystem(system){
  const cpu = system.cpu * 100;
  document.getElementById('cpu-load-bar').setAttribute("aria-valuenow", cpu);
  document.getElementById('cpu-load-bar').style.width = `${cpu.toFixed(2)}%`;
  document.getElementById('cpu-load-value').innerText = `${cpu.toFixed(2)}%`;

  const mem = system.mem * 100;
  document.getElementById('mem-bar').setAttribute("aria-valuenow", mem);
  document.getElementById('mem-bar').style.width = `${mem.toFixed(2)}%`;
  document.getElementById('mem-value').innerText = `${mem.toFixed(2)}%`;
}
