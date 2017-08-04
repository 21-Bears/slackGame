const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const {GameData} = require('./gameEngine');
//const { createMessageAdapter } = require('@slack/interactive-messages');

// Initialize using verification token from environment variables
//const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN ||'AH4knYuu3IfcuMKzdrXQzbfE');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/slack/actions', slackMessages.expressMiddleware());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/',(req,res)=>{

  //This should be removed before released publicly
  if(req.body.text === "reset" ){
    GameData.resetData();
    res.status(200).send("Server data reset!");
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



module.exports = {app};
