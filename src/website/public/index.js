function init(){
  fetchServices();
  updateTime();
  setInterval(function() {updateTime();}, 500);
}

function fetchServices(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      var services = JSON.parse(xhr.responseText);
      var count = services.length;
      var reachable = 0;
      services.forEach((service) => {
        if(service.reachable){
          reachable++;
        }
      });
      document.getElementById('serv-status').innerHTML = reachable + ' / ' + count + ' services running.';
      if(reachable != count){
        document.getElementById('serv-status').classList.add('text-danger');
      } else {
        document.getElementById('serv-status').classList.add('text-success');
      }
    }
  };
  xhr.open("GET", "https://www.ondralukes.cz/rawstatus", true);
  xhr.send(null);
}

function updateTime(){
  document.getElementById('age').innerHTML = Math.floor((new Date().getTime() - 1081904400000) / 31548960000.0);
  var time = new Date().getTime() - 1283415010000;
  var years = Math.floor(time / 31548960000);
  time -= years * 31548960000;
  var days = Math.floor(time / 86400000);
  document.getElementById('time').innerHTML = years + ' years and ' + days + (days==1?' day':' days');
}
