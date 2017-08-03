
//messages.js - Used to compile and send slack messages via urlencoded

var request = require('request');

/*
Notes:
  Static Messages:
    1. New Game / Join Game
    2. Waiting for opponent
    3. goodbye
  Dynamic Messages:
    1. Join List
    2. Move Select
    3. Attack selection
    4. resaults

    -----------------
    request(
        {
        url: url,
        method: "POST",
        json: true,   // <--Very important!!!
        body: msg
        },
        function (err){
        if(err){ cb(err,null); return; }
        cb(null);
        });
*/

const host = "bears21.herokuapp.com";
const protocol = "https";

let staticMessages = {
  "start": {
    "text": "Welcome to *****",
    "attachments": [
      {
          "text": "Would you like to start a new game or join one?",
          "fallback": "You are unable to choose a game",
          "callback_id": "start_select",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                  "name": "new_game",
                  "text": "New Game",
                  "type": "button",
                  "value": "newGame"
              },
              {
                  "name": "join_game",
                  "text": "Join Game",
                  "type": "button",
                  "value": "joinList"
              } ]
  } ] },
  "waiting": {
    "text": "Waiting on opponent....",
    "attachments": [
      {
        "text": "If you want to leave click the exit button...",
        "fallback": "You are unable to quit this game!!!",
          "callback_id": "waiting_opp",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                  "name": "quit_game",
                  "text": "Exit",
                  "type": "button",
                  "value": "quit"
              }]
  }] },
  "goodbye":{
    "text": "Thanks for playing ******, goodbye."
  }
};

var exports = module.exports = {};

 var Message = function( ){

  this.send = function( url, msg ){
    console.log("Send message to URL: "+url);
    request( {
      uri: url,
      method: "POST",
      json: true,
      body: msg
    }, (err) => { console.log("Error sending message! "+err); return err; } );
  };

  this.sendStatic = function( url, type ){
    if(!staticMessages[type]){ return "Invalid static type: "+type; }
    this.send( url, staticMessages[type] );
  };

  this.sendJoinList = function( url, list ){
      let message = {
          "text": "Select the game you would like to join.",
          "attachments": [
            {
                "callback_id": "join_select",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
        } ],
      };
      list.forEach( (cv)=>{ //Add a button for each id on the list
        message.attachments[0].actions.push({
          "name" : ""+cv,
          "text" : "Game #"+cv,
          "type" : "button",
          "value" : "join"
        });
      });

      message.attachments[0].actions.push({ //A a next
        "name" : "nextPage",
        "text" : "Next Page",
        "type" : "button",
        "value" : "nextPage"
      });

      this.send( url, message );
  };

  this.sendMoveSelect = function( url, pos, gameID ){
    const imageURL =  protocol + '://' + host + '/assets/pos_'+pos+'.png';
    let message = {
      "text": "Choose your next move:",
      "attachments": [
        {
            "callback_id": "move_select",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL,
            "actions": [
                  {
                      "name": ""+gameID,
                      "text": "Conter-Clockwise x2",
                      "type": "button",
                      "value": "moveCCW2"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Conter-Clockwise",
                      "type": "button",
                      "value": "moveCCW"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Stay",
                      "type": "button",
                      "value": "stay"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Clockwise",
                      "type": "button",
                      "value": "moveCW"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Clockwise x2",
                      "type": "button",
                      "value": "moveCW2"
                  }
            ]
          } ]
    };
    this.send( url, message );
  }

  this.sendAttackSelect = function( url, pos, gameID ){
    const imageURL = protocol + '://' + host + '/assets/pos_'+pos+'.png';
    let message = {
      "text": "Select your attack:",
      "attachments": [
        {
            "callback_id": "attack_select",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL,
            "actions": [
                  {
                      "name": ""+gameID,
                      "text": "Attack A",
                      "type": "button",
                      "value": "attackA"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Attack B",
                      "type": "button",
                      "value": "attackB"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Attack C",
                      "type": "button",
                      "value": "attackC"
                  },
                  {
                      "name": ""+gameID,
                      "text": "Attack D",
                      "type": "button",
                      "value": "attackD"
                  }
            ]
          } ],
    };
    this.send( url, message );
  };

  this.sendResaults = function( url1, url2, pos, attack, gameID, message_text ){
    let imgeURL = ""
    if( attack ){ imageURL = protocol + '://' + host + '/assets/pos_'+pos+'_attack_'+attack+'.png'; }

    let message = {
      "text" : message_text,
      "attachments": [
        {
            "callback_id": "resaults",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL
          }]
    };

    this.send( url1, message ); //The player that just attacked/moved

    message.attachments[0].actions.push( { //Add continue button for non-active player
      "name": ""+gameID,
      "text": "Continue",
      "type": "button",
      "value": "continue"
     } );

    this.send( url2, message );
  };

};

exports.Message = new Message();
