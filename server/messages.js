
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
    4. results

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

  this.sendJoinList = function( url, list, addedText = "" ){
      let messsage = {};
      if(list.length === 0){

        message = {
          "text": addedText+"There aren't any games to join.",
          "attachments": [
            {
                "text" : "No avalible games:",
                "fallback": "Can not show game buttons!!!",
                "callback_id": "start_select",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                  {
                  "name": "new_game",
                  "text": "New Game",
                  "type": "button",
                  "value": "newGame"
              },              {
                  "name": "quit_game",
                  "text": "Exit",
                  "type": "button",
                  "value": "quit"
              }
                ]
        } ],
      };
      } else {
      message = {
          "text": addedText+"Select the game you would like to join.",
          "attachments": [
            {
                "text" : "Avalible games:",
                "fallback": "Can not show game buttons!!!",
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
    }
      this.send( url, message );

  };

  this.sendMoveSelect = function( url, pos, gameID, playerData ){
    const imageURL =  protocol + '://' + host + '/assets/pos_'+pos+'.png';
    let message = {
      "text": `You have ${playerData} health remaining. Choose your next move:`,
      "attachments": [
        {
            "text" : "Please select one of the following:",
            "fallback" : "Unable to show moves.",
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

  this.sendAttackSelect = function( url, pos, gameID, moveSuccessful){
    const imageURL = protocol + '://' + host + '/assets/pos_'+pos+'.png';
    const messageText = moveSuccessful ? "Select your attack:" : "Move failed, your opponent occuupies the that position. Select your attack:"
    let message = {
      "text": messageText,
      "attachments": [
        {
            "text": "Please select one of the following:",
            "fallback": "You are unable to choose an attack!",
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

  this.sendGameOver = function(  url1, url2, pos, attack, gameID, attacker){
    let imgeURL = ""
    if( attack ){ imageURL = protocol + '://' + host + '/assets/pos_'+pos+'_attack_'+attack+'.png'; }
    let message1 = {
      "text" : "Game Over. You Won!",
      "attachments": [
        {
            "text": "Results:",
            "fallback": "Unable to show results!",
            "callback_id": "results",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL,
            "actions": [
                {
                    "name": "quit_game",
                    "text": "Exit",
                    "type": "button",
                    "value": "quit"
                }]
          }]
    };

    let message2 = {
      "text" : "Game Over. You Lost!",
      "attachments": [
        {
            "text": "Results:",
            "fallback": "Unable to show results!",
            "callback_id": "results",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL,
            "actions": [
                {
                    "name": "quit_game",
                    "text": "Exit",
                    "type": "button",
                    "value": "quit"
                }]
          }]
    };

    this.send( url1, message1 ); //The player that just attacked/moved

    this.send( url2, message2 );
  };

  this.sendResults = function( url1, url2, pos, attack, gameID, message_text ){
    let imgeURL = ""
    if( attack ){ imageURL = protocol + '://' + host + '/assets/pos_'+pos+'_attack_'+attack+'.png'; }

    let message = {
      "text" : message_text,
      "attachments": [
        {
            "text": "Results:",
            "fallback": "Unable to show results!",
            "callback_id": "results",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "image_url": imageURL,
            "actions" : []
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
