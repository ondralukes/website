function fetchServices(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      addServices(JSON.parse(xhr.responseText));
    }
  };
  xhr.open("GET", "/rawstatus", true);
  xhr.send(null);
}

function addServices(services){
  var template = document.getElementById('serv-template');
  services.forEach((service) => {
    var clone = template.cloneNode(true);
    clone.id = 'serv-' + service.name;
    clone.style.display = "";
    clone.getElementsByClassName('serv-name')[0].innerHTML = service.name;
    clone.getElementsByClassName('serv-url')[0].innerHTML = service.url;
    clone.getElementsByClassName('serv-target')[0].innerHTML = service.target;
    var reachableElement = clone.getElementsByClassName('serv-reachable')[0];
    if(service.reachable){
      reachableElement.innerHTML = "Yes";
      reachableElement.classList.add('font-weight-bold');
      reachableElement.classList.add('text-success');
    } else {
      reachableElement.innerHTML = "No";
      reachableElement.classList.add('font-weight-bold');
      reachableElement.classList.add('text-danger');
    }
    var containerElement = clone.getElementsByClassName('serv-container')[0];
    var containerRowTemplate = containerElement.getElementsByClassName('serv-container-row')[0];
    if(typeof service.container !== 'undefined'){
      var keys = Object.keys(service.container);
      keys.forEach((key) => {
        var row = containerRowTemplate.cloneNode(true);
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
