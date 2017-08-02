
var request = require('request');

var { Player } = require("./player.js");
var { GameObj } = require("./gameObj.js");

var exports = module.exports = {};

GameData = function(){
  this.players = [];
  this.openGames = [];
  this.activeGames = [];
  this.idCnt = 0; //This is used to assign each game a unique ID and goes up by one every time a new game is created

  this.runData = function(data){
      if(!data.user_id){ return "Error, user_id not in provided data: "+data; }

      let index = this.players.findIndex(cv=>{
        if( cv.userID === data.user_id ){ return true; }
        return false;
      });

      if( index === -1 ){
        this.players.push( new Player( data.user_name, data.user_id, "init", data.response_url ) );
        //Send init message with "new Game / join game"
        //return `success ${data.user_name}`;
        return{  
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
      }

      this.players[ index ].callbackURL =  data.response_url; //Update the res_url everytime a new message is recieved
      //2. Player was found, check action_value
      //Menu Functions
      let offset = 0;
      let jList = [];
      switch( data.action_value ){
        case "newGame":
          this.openGames.push( new GameObj( data.user_id, this.idCnt ) );
          this.idCnt++;
          //Send waiting for opponent message
          return "success";
          break;
        case "joinList":
          jList = this.getJoinList( 0 );
          this.players[index].menuState = "gameList0";
          //Send joinList message
          return "success";
          break;
        case "nextPage":
          offset = ( +this.players[index].menuState.substring( 8 ) ) + 1;
          this.players[index].menuState = "gameList"+offset;
          jList = this.getJoinList( offset );
          //Send joinList message
          return "success";
          break;
        case "quit":
          //Send goodbye message
          this.players.splice( index, 1 ); //Remove player form players list
          return "success";
          break;
      };

//Game logic:
      const gameID = data.action_name;
      const command = data.action_value;
      const openGamesIndex = this.openGames.findIndex( cv => { return ""+cv.id === gameID; } );
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === gameID; } );
      if( command !== "join" && activeGamesIndex === -1 ){ return "ERROR: Game not found on active game list."; }
      let res = 0;


      //May need to make sure that the user passing the command is the active player( except for "continue" ). This should never
      //happen, but could if something goes wrong or someone is trying to "hack" it.

      switch(command){
        case "join":
          if( this.openGames[ openGamesIndex ].addPlayer( data.user_id ) === "success" ){
            this.players[ index ].menuState = "inGame";
            //this.players[ this.openGames[ openGamesIndex ].players[0] ].menuState = "inGame";
            this.openGames[ openGamesIndex ].rand(); //Randomize the inital settings
            this.openGames[ openGamesIndex ].menuState = "moveSelect";
            //Send active player "move Select" message
            //send non-active player "waiting on opponent" message
            this.activeGames.push( this.openGames.splice(openGamesIndex,1)[0] ); //Remove game from openList and add it to activeList
            return "success";
          }
          else { //Could not join the game - This would happen if the game fills up between the time this list is given to the user and the time they clicked the button
            //Send message "Could not join game" + joinList Message
            return "success";
          }
          break;
        case "moveCW":
            if( this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //send player "attack slection" message
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //Send "unable to move" + "attack selection" messages
            }
            return "success";
          break;
        case "moveCCW":
            if( this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //send player "attack slection" message
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //Send "unable to move" + "attack selection" messages
            }
            return "success";
          break;
        case "moveCW2":
            if( this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" && this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "resaults";
              //send both players "resaults" message
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "resaults";
              //Send "unable to move" to active  + "resaults" messages to both
            }
            return "success";
          break;
        case "moveCCW2":
            if( this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" && this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "resaults";
              //send both players "resaults" message
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "resaults";
              //Send "unable to move" to active  + "resaults" messages to both
            }
            return "success";
          break;
        case "attackA":
            res = this.activeGames[ activeGamesIndex ].runAttack("A");
            this.activeGames[ activeGamesIndex ].menuState = "resaults";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send resaults + Game Over + button to go back to init menu
              return "success";
            }
            //send resaults message to both players
            return "success";
          break;
        case "attackB":
            res = this.activeGames[ activeGamesIndex ].runAttack("B");
            this.activeGames[ activeGamesIndex ].menuState = "resaults";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send resaults + Game Over + button to go back to init menu
              return "success";
            }
            //send resaults message to both players
            return "success";
          break;
        case "attackC":
            res = this.activeGames[ activeGamesIndex ].runAttack("C");
            this.activeGames[ activeGamesIndex ].menuState = "resaults";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send resaults + Game Over + button to go back to init menu
              return "success";
            }
            //send resaults message to both players
            return "success";
          break;
        case "attackD":
            res = this.activeGames[ activeGamesIndex ].runAttack("D");
            this.activeGames[ activeGamesIndex ].menuState = "resaults";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send resaults + Game Over + button to go back to init menu
              return "success";
            }
            //send resaults message to both players
            return "success";
          break;
        case "continue":
            this.activeGames[ activeGamesIndex ].ply1Turn = !this.activeGames[ activeGamesIndex ].ply1Turn;
            this.activeGames[ activeGamesIndex ].menuState = "moveSelect";
            //send move Select message to active playerID
            //send waiting on opponent message to non-active player
            return "success";
          break;
        case "endGame":
          //Send init message to both players ( "new game / join game" )
          this.activeGames.splice( activeGamesIndex, 1 ); //Delete game from activeGames list
          return "success";
          break;
      };     
  }
 this.getJoinList = function(offset){
   return this.openGames.slice(offset*4,(offset*4)+4).map( cv => { return cv.id; } );
 }

};

exports.GameData = new GameData();
