const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
var mongoose = require("mongoose");
const {GameData} = require('./gameEngine2');
var { DatabaseHelper } = require("./databaseHelper.js");
var { Message } = require("./messages.js");
const request = require('request');


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
  //console.log("MongoDB Database connected");
});
app.get('/slack/authorization',(req,res)=>{
    var options = {
        uri: 'https://slack.com/api/oauth.access?code='
            +req.query.code+
            '&client_id='+ '158522499188.217829987060'+//process.env.CLIENT_ID+
            '&client_secret='+ '3a36ac1322f113448a6f23508cef1b69'+//process.env.CLIENT_SECRET+
            '&redirect_uri='+ 'https://bears21.herokuapp.com/slack/authorization',
        method: 'GET'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            console.log(JSONresponse)
            res.send("Success!")
        }
    })

});
app.get('/',(req,res)=>{
	res.sendFile(path.join(__dirname+'./../public/html/index.html')); });

app.post('/api/',(req,res)=>{

  //This should be removed before released publicly
  if(req.body.text === "reset" ){
    GameData.resetData();
    res.status(200).send("Server data reset!");
    return;
  }

  if(req.body.text === "exit" ){
    GameData.removePlayer(req.body.user_id);
    res.status(200).send();
    return;
  }
  if(req.body.text === "help" ){

    Message.sendHelp(req.body.response_url)
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

  if(req.body.text === "topTen"){
    DatabaseHelper.queryDatabase().then((response, error) => {
      if(error) {
        res.status(400).send();

      } else {
        Message.sendTopTen(req.body.response_url, response)

      }

    })
    return;
    }

    if(req.body.text === "myRank"){
    DatabaseHelper.queryDatabaseForUser().then((response, error) => {
      if(error) {
        res.status(400).send();

      } else {
        let rank;
        response.map((user, index) => {

          if(user.UID === req.body.user_id) {
            rank = index + 1;
          }
        })
        //console.log(rank + " " + response.length);
        Message.sendMyRank(req.body.response_url, rank, response.length)

      }

    })
    return;
    }

  let slackData = {};
 if( req.body.payload ){
   let data = JSON.parse(req.body.payload);
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

GameData.runData(slackData);
res.status(200).send();
});

module.exports = {app};
