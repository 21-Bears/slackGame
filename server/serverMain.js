const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();
app.port = 3000;
app.use(bodyParser.json());


app.post('/userInput',(req,res)=>{
	let body = _.pick(req.body,'command');

	
});

module.exports = {app};