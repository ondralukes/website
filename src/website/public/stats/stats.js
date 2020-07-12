function fetchStats() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            const stats = JSON.parse(xhr.responseText);

            document.getElementById('minute').innerText = stats.thisMinute.total;
            document.getElementById('minute-unique').innerText = stats.thisMinute.unique;

            document.getElementById('hour').innerText = stats.thisHour.total;
            document.getElementById('hour-unique').innerText = stats.thisHour.unique;

            document.getElementById('today').innerText = stats.today.total;
            document.getElementById('today-unique').innerText = stats.today.unique;

            document.getElementById('month').innerText = stats.thisMonth.total;
            document.getElementById('month-unique').innerText = stats.thisMonth.unique;

            document.getElementById('year').innerText = stats.thisYear.total;
            document.getElementById('year-unique').innerText = stats.thisYear.unique;

            document.getElementById('total').innerText = stats.total.total;
            document.getElementById('total-unique').innerText = stats.total.unique;
        }
    };
    xhr.open("GET", "/getstats", true);
    xhr.send(null);
}