const express = require('express');
var app = express();

const port = 8080;

app.use(express.static('public'))

var server = app.listen(port);
