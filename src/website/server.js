const express = require('express');
var app = express();

const port = 8080;

app.use(express.static('public'));

app.use((req, res) => {
    res.status(404).sendFile('public/404.html', {root: __dirname});
});

var server = app.listen(port);
