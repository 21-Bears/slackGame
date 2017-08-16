const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
var mongoose = require("mongoose");
const {GameData} = require('./gameEngine2');
var { DatabaseHelper } = require("./databaseHelper.js");
var { Message } = require("./messages.js");

//const { createMessageAdapter } = require('@slack/interactive-messages');

// Initialize using verification token from environment variables
//const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN ||'AH4knYuu3IfcuMKzdrXQzbfE');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/slack/actions', slackMessages.expressMiddleware());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Mongoose db setup
// Remove temporary username / password for production
var mongoUser = process.env.DB_USERNAME || 'admin';
var mongoPass = process.env.DB_PASSWORD || 'pass';

mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@ds053944.mlab.com:53944/round-table-battle`);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection eror:"));
db.once("open", function() {
  console.log("MongoDB Database connected");
});


app.post('/api/',(req,res)=>{

  //This should be removed before released publicly
  if(req.body.text === "reset" ){
    GameData.resetData();
    res.status(200).send("Server data reset!");
    return;
  }

  if(req.body.text === "gameData" ){
    res.status(200).send( JSON.stringify(GameData.activeGames[0]) );
    return;
  }

  if(req.body.text === "playerData" ){
    res.status(200).send( JSON.stringify(GameData.players) );
    return;
  }

  if(req.body.text === "topTen" && req.body.payload ){
        console.log('in topTen');

    
    DatabaseHelper.queryDatabase().then((response, error) => {
        console.log('in then');
      
      if(error) {
 
        res.status(400).send();
        
        
      } else {
        console.log('response', req.body.response_url)
        
        Message.sendTopTen(req.body.response_url, response)
        
 
       
      }      
      
      
    })
    return;
    }

  let slackData = {};
 if( req.body.payload ){
   let data = JSON.parse(req.body.payload);
   console.log( data, typeof(data) );
   slackData = {
   user_name: data.user.name,
   user_id: data.user.id,
   response_url: data.response_url,
   action_name : data.actions[0].name,
   action_value :data.actions[0].value
  }
 }
 else {
   slackData = { user_name: req.body.user_name,
                 user_id: req.body.user_id,
                 response_url: req.body.response_url };
 }

console.log(slackData);
GameData.runData(slackData);
res.status(200).send();
});

app.post('/',(req,res)=>{
let slackData = { user_name: req.body.user_name,
              user_id: req.body.user_id,
              ref_url: req.body.response_url};


// res.status(200).send();

res.json(GameData.runData(slackData));
});
/*
slackMessages.action('startGame', (payload) => {
  let slackData = { user_name: payload.user.name,
              user_id: payload.user.id,
              ref_url: payload.response_url,
              action_name: payload.actions[0].name,
              action_value: payload.actions[0].value
            };

//res.status(200).send();
res.json(GameData.runData(slackData));

});

*/

module.exports = {app};
