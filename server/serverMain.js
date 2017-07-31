const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const GameData = require('./gameEngine');
const { createMessageAdapter } = require('@slack/interactive-messages');

// Initialize using verification token from environment variables
const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN ||'AH4knYuu3IfcuMKzdrXQzbfE');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/slack/actions', slackMessages.expressMiddleware());

app.post('/',(req,res)=>{
let slackData = { user_name: req.body.user_name,
              user_id: req.body.user_id,
              ref_url: req.body.response_url};

GameData.runData(slackData);
res.status(200).send();	
});

slackMessages.action('startGame', (payload) => {
  let slackData = { user_name: payload.user.name,
              user_id: payload.user.id,
              ref_url: payload.response_url,
              action_name: payload.actions[0].name,
              action_value: payload.actions[0].value
            };

res.status(200).send();
  
});



module.exports = {app};
