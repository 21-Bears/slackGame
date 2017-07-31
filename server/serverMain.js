const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { createMessageAdapter } = require('@slack/interactive-messages');

// Initialize using verification token from environment variables
const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN ||'AH4knYuu3IfcuMKzdrXQzbfE');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/slack/actions', slackMessages.expressMiddleware());

let data = {  
      "text": "presented by Bears21!",
    	"attachments": [              
        {            
            "title": "Would you like to play slackGame?",
            "callback_id": "startGame",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "yes",
                    "text": "Yes",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "no",
                    "text": "No",
                    "type": "button",
                    "value": "no"
                }
            ]
        }
    ]
};

app.post('/',(req,res)=>{
res.json(data);	
});

slackMessages.action('startGame', (payload) => {
  console.log(payload);

  const action = payload.actions[0];
  data.text = `Welcome ${payload.user.name}!`;
  data.attachments[0].title = 'Would you like to start a new game or join one?';
  data.callback_id = 'newOrJoin';
  data.attachments[0].actions = [{
                    "name": "newGame",
                    "text": "New Game",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "joinGame",
                    "text": "Join Game",
                    "type": "button",
                    "value": "no"
                }];
return data;
  
});



module.exports = {app};
