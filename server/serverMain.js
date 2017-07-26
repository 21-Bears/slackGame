//Server's main code..
"use strict";
const express = require('express');
const port = process.env.PORT || 3000;
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/api/*', (req,res) => {
  res.status(200).send(req.body);
});

app.get('/', (req, res) => {
  res.status(200).sendFile( path.join( __dirname, '..', 'public', 'index.html' ) );
});

module.exports = app;
module.exports.port = port;
