//Server's main code..
const express = require('express');
var path = require("path");
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();
app.port = 3000;
app.use(bodyParser.json());


app.post('/userInput',(req,res)=>{
	let body = _.pick(req.body,'command');


});
app.use(express.static( __dirname + './../public/html'));
app.use(express.static( __dirname + './../public/css'));
app.use(express.static( __dirname + './../public/assets'));
app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname+'./../public/htmlindex.html'));


});


module.exports = {app};
