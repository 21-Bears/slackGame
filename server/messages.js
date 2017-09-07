
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
    "text": "Welcome to Round Table Battle -ver 1.0-",
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
    "text": "Waiting for opponent to join....",
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
  "waitingOn": {
    "text": "Waiting on opponent to finish their turn....",
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
    "text": "Thanks for playing Round Table Battle, goodbye."
  }
};

var exports = module.exports = {};

 var Message = function( ){

  this.send = function( url, msg ){
    request( {
      uri: url,
      method: "POST",
      json: true,
      body: msg
    }, (err) => { return err; } );
  };

  this.sendStatic = function( url, type ){
    if(!staticMessages[type]){ return "Invalid static type: "+type; }
    this.send( url, staticMessages[type] );
  };

  this.sendHelp = function( url ){
    message = {
      "text": "Help",
      "attachments": [
        {
          "text": "Dash allows you to move two spaces but you aren't able to attack\nAttack A - does 10 damage to position directly across from you\nAttack B - does 5 damage to positions 5 clockwise and counterclockwise of you\nAttack C - does 3 damage to positions 4 spots clockwise and counterclockwise of you\nAttack D - does 10 damage to positions directly clockwise and counterclockwise of you",
          "fallback": "You are unable to quit this game!!!",
            "callback_id": "help",
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
    this.send( url, message);
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

  
this.sendDashSelect = function( url, pos, gameID, playerData = 10 ){

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
                      "text": "Counter-Clockwise x2",
                      "type": "button",
                      "value": "moveCCW2"
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


  this.sendMoveSelect = function( url, pos, gameID, playerData = 10 ){

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
                      "text": "Clockwise",
                      "type": "button",
                      "value": "moveCW"
                  },
                   {
                      "name": ""+gameID,
                      "text": "Stay",
                      "type": "button",
                      "value": "stay"
                  },

                  {
                      "name": ""+gameID,
                      "text": "Conter-Clockwise",
                      "type": "button",
                      "value": "moveCCW"
                  }
                 

            ]
          } ]
    };
    this.send( url, message );
  }

  this.sendAttackSelect = function( url, pos, gameID, playerData = 30,moveSuccessful = true, powerUp = false){
    const imageURL = protocol + '://' + host + '/assets/pos_'+pos+'.png';
    let messageText = moveSuccessful ? "Select your attack:" : "Move failed, your opponent occuupies that position. Select your attack:"
    if( powerUp ){ messageText = "You found a Power-up! ( 2 x Damage on next attack ). Select your attack:"; }
    let message = {
      "text": `You have ${playerData} health remaining.\n` + messageText,
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
                      "text": "Dash",
                      "type": "button",
                      "value": "dash"
                  },
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
    let imageURL = ""
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
                    "name": ""+gameID,
                    "text": "Exit",
                    "type": "button",
                    "value": "quit"
                },
                {
                    "name": ""+gameID,
                    "text": "Rematch",
                    "type": "button",
                    "value": "rematch"
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
                    "name": ""+gameID,
                    "text": "Exit",
                    "type": "button",
                    "value": "quit"
                },
                {
                    "name": ""+gameID,
                    "text": "Rematch",
                    "type": "button",
                    "value": "rematch"
                }]
          }]
    };

    this.send( url1, message1 ); //The player that just attacked/moved

    this.send( url2, message2 );
  };
  this.sendTopTen = function( url1, topTen ){
    let message_text = '';
    topTen.map((user, index) => {
      message_text += `${index+1}.) ${user.name} - ${user.wins}\n`
    })
     
    let message = {
      "text" : "Top Ten",
      "attachments": [
        {
            "text": message_text,
            "fallback": "Unable to show results!",
            "callback_id": "results",
            "color": "#3AA3E3",
            "attachment_type": "default",
           
            "actions" : []
          }]
    };
     
    this.send( url1, message );     
       };
     
        this.sendMyRank = function( url1, rank, field ){
    let message_text = '';
    let lastDigit = rank % 10;
    switch(lastDigit){
      case 1:
        if(rank % 100 === 11){
        rank += "th"
          
        } else {
        rank += "st"; }
        break;
      case 2:
        if(rank % 100 === 12){
        rank += "th"
          
        } else {
        rank += "nd"; }
        break;
      case 3:
        if(rank % 100 === 13){
        rank += "th"
          
        } else {
        rank += "rd"; }
        break;
      default:
        rank += 'th';
        break;
    }
    
    message_text += `You rank ${rank} out of ${field} total players`; 
     
    let message = {
      "text" : "Your Rank",
      "attachments": [
        {
            "text": message_text,
            "fallback": "Unable to show results!",
            "callback_id": "results",
            "color": "#3AA3E3",
            "attachment_type": "default",
           
            "actions" : []
          }]
    };
     
    this.send( url1, message );     
       };
     

  this.sendResults = function( url1, url2, pos, attack, gameID, message_text, powerUp = false ){
    let imageURL = protocol + '://' + host + '/assets/blankBoard.png';
    if( attack ){ imageURL = protocol + '://' + host + '/assets/pos_'+pos+'_attack_'+attack+'.png'; }
    const resText = message_text;
    if( powerUp ){ resText = "You found a Power-up. ( 2 x damage on your next attack ) "+message_text; }

    let message = {

      "text" : resText,
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

    this.send( url2, message ); //The player that just attacked/moved
    message.attachments[0].text = message_text;
    message.attachments[0].actions.push( { //Add continue button for non-active player
      "name": ""+gameID,
      "text": "Continue",
      "type": "button",
      "value": "continue"
     } );

    this.send( url1, message );
  };

  

};

exports.Message = new Message();


