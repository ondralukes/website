const express = require('express');

const statsCounter = require('stats-counter');
var app = express();

const port = 8080;

app.use(
    statsCounter(
        {
            visitTime: 300,
            apiPath: '/getstats',
            savePath: '/var/website-stats/stats'
        }
    )
);

app.use(express.static('public'));

app.use((req, res) => {
    res.status(404).sendFile('public/404.html', {root: __dirname});
});

var server = app.listen(port);
