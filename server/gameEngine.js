var { Player } = require("./player.js");
var { GameObj } = require("./gameObj.js");
var { Message } = require("./messages.js");

var exports = module.exports = {};


var GameData = function(){
  this.players = [];
  this.openGames = [];
  this.activeGames = [];
  this.idCnt = 0; //This is used to assign each game a unique ID and goes up by one every time a new game is created

  this.resetData = function(){
    this.players = [];
    this.openGames = [];
    this.activeGames = [];
    this.idCnt = 0;
  }

  this.getPlayerURL = function(id){
    let index = this.players.findIndex(cv=>{ return cv.userID === id;  });
    if( index === -1 ){ return "Error, invalid user id"; }
    return this.players[index].callbackURL;
  }

  this.runData = function(data){
      if(!data.user_id){ return "Error, user_id not in provided data: "+data; }

      let index = this.players.findIndex(cv=>{
        if( cv.userID === data.user_id ){ return true; }
        return false;
      });

      if( index === -1 ){
        this.players.push( new Player( data.user_name, data.user_id, "init", data.response_url ) );
        //Send init message with "new Game / join game"
          Message.sendStatic(data.response_url,"start");
        return `success`;
        /*return{
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
}; */
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
          Message.sendStatic(data.response_url,"waiting");
          return "success";
          break;
        case "joinList":
          jList = this.getJoinList( 0 );
          this.players[index].menuState = "gameList0";
          //Send joinList message
          Message.sendJoinList( data.response_url , jList );
          return "success";
          break;
        case "nextPage":
          offset = ( +this.players[index].menuState.substring( 8 ) ) + 1;
          this.players[index].menuState = "gameList"+offset;
          jList = this.getJoinList( offset );
          //Send joinList message
          Message.sendJoinList( data.response_url , jList );
          return "success";
          break;
        case "quit":
          //Send goodbye message
          Message.sendStatic(data.response_url,"goodbye");
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

      let activePlayerID, nonactivePlayerID, activePlayerPos, nonactivePlayerPos;

      if( command !== "join" ){
        activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
        nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
        activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);
        nonactivePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(false);
      }

      else {
        activePlayerID = this.openGames[ openGamesIndex ].getPlayerID(true);
        nonactivePlayerID = this.openGames[ openGamesIndex ].getPlayerID(false);
      }


      //May need to make sure that the user passing the command is the active player( except for "continue" ). This should never
      //happen, but could if something goes wrong or someone is trying to "hack" it.

      switch(command){
        case "join":
          if( this.openGames[ openGamesIndex ].addPlayer( data.user_id ) === "success" ){
            this.players[ index ].menuState = "inGame";
            //this.players[ this.openGames[ openGamesIndex ].players[0] ].menuState = "inGame";
            this.openGames[ openGamesIndex ].rand(); //Randomize the inital settings
            activePlayerPos = this.openGames[ openGamesIndex ].getPlayerPos(true);
            activePlayerID = this.openGames[ openGamesIndex ].getPlayerID(true);
            nonactivePlayerID = this.openGames[ openGamesIndex ].getPlayerID(false);
            this.openGames[ openGamesIndex ].menuState = "moveSelect";
            //Send active player "move Select" message
            Message.sendMoveSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.openGames[ openGamesIndex ].id );
            //send non-active player "waiting on opponent" message
            Message.sendStatic(this.getPlayerURL(nonactivePlayerID),"waiting");
            this.activeGames.push( this.openGames.splice(openGamesIndex,1)[0] ); //Remove game from openList and add it to activeList
            console.log("Starting new game, messages sent.");
            return "success";
          }
          else { //Could not join the game - This would happen if the game fills up between the time this list is given to the user and the time they clicked the button
            //Send message "Could not join game" + joinList Message
            jList = this.getJoinList( 0 );
            this.players[index].menuState = "gameList0";
            //Send joinList message
            Message.sendJoinList( data.response_url , jList );
            console.log("Player could not join game.");
            return "success";
          }
          break;
        case "moveCW":
            if( this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //send player "attack slection" message
              Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id, true );
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //Send "unable to move" + "attack selection" messages
              Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id, false );
            }
            return "success";
          break;
        case "moveCCW":
            if( this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //send player "attack slection" message
              Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id, true );
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
              //Send "unable to move" + "attack selection" messages
              Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id, false );
            }
            return "success";
          break;
        case "moveCW2":
            if( this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" && this.activeGames[ activeGamesIndex ].movePlayer(true) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "results";
              //send both players "results" message
              Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, null, this.activeGames[ activeGamesIndex ].id, "Player did not attack." );
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "results";
              //Send "unable to move" to active  + "results" messages to both
              //Should a failure to move here let the player have a chance to move again, so they can move once CW or CCW and try and attack?
              Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, null, this.activeGames[ activeGamesIndex ].id, "Player did not attack." );
            }
            return "success";
          break;
        case "moveCCW2":
            if( this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" && this.activeGames[ activeGamesIndex ].movePlayer(false) === "success" ){
              this.activeGames[ activeGamesIndex ].menuState = "results";
              //send both players "results" message
              Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, null, this.activeGames[ activeGamesIndex ].id, "Player did not attack." );
            }
            else {
              this.activeGames[ activeGamesIndex ].menuState = "results";
              //Send "unable to move" to active  + "results" messages to both
              //Should a failure to move here let the player have a chance to move again, so they can move once CW or CCW and try and attack?
              Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, null, this.activeGames[ activeGamesIndex ].id, "Player did not attack." );
            }
            return "success";
          break;
        case "stay" :
          this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
          this.activeGames[ activeGamesIndex ].playerData.attackCnt = 2;
          //Send Attack selection message
          Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos ,this.activeGames[ activeGamesIndex ].id );
          return "success";
          break;
        case "attackA":
            res = this.activeGames[ activeGamesIndex ].runAttack("A");
            this.activeGames[ activeGamesIndex ].menuState = "results";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send results + Game Over + button to go back to init menu
              return "success";
            }
            //send results message to both players
            if(res === "HIT" ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "a", this.activeGames[ activeGamesIndex ].id, "Hit for 10 damage!" ); }
            else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "a", this.activeGames[ activeGamesIndex ].id, "Attack 'A' missed!" ); }
            return "success";
          break;
        case "attackB":
            res = this.activeGames[ activeGamesIndex ].runAttack("B");
            this.activeGames[ activeGamesIndex ].menuState = "results";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send results + Game Over + button to go back to init menu
              return "success";
            }
            //send results message to both players
            if(res === "HIT" ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "b", this.activeGames[ activeGamesIndex ].id, "Hit for 5 damage!" ); }
            else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "b", this.activeGames[ activeGamesIndex ].id, "Attack 'B' missed!" ); }
            return "success";
          break;
        case "attackC":
            res = this.activeGames[ activeGamesIndex ].runAttack("C");
            this.activeGames[ activeGamesIndex ].menuState = "results";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send results + Game Over + button to go back to init menu
              return "success";
            }
            //send results message to both players
            if(res === "HIT" ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "c", this.activeGames[ activeGamesIndex ].id, "Hit for 3 damage!" ); }
            else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "c", this.activeGames[ activeGamesIndex ].id, "Attack 'C' missed!" ); }
            return "success";
          break;
        case "attackD":
            res = this.activeGames[ activeGamesIndex ].runAttack("D");
            this.activeGames[ activeGamesIndex ].menuState = "results";
            if( this.activeGames[ activeGamesIndex ].checkGameOver() ){
              //Send results + Game Over + button to go back to init menu
              Message.sendGameOver( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "d", this.activeGames[ activeGamesIndex ].id);
              return "success";
            }
            //send results message to both players
            if(res === "HIT" ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "d", this.activeGames[ activeGamesIndex ].id, "Hit for 10 damage!" ); }
            else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, "d", this.activeGames[ activeGamesIndex ].id, "Attack 'D' missed!" ); }
            return "success";
          break;
        case "continue":
            this.activeGames[ activeGamesIndex ].ply1Turn = !this.activeGames[ activeGamesIndex ].ply1Turn;
            this.activeGames[ activeGamesIndex ].menuState = "moveSelect";
            //send move Select message to active playerID
            let playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]
            Message.sendMoveSelect( this.getPlayerURL(nonactivePlayerID), nonactivePlayerPos , this.activeGames[ activeGamesIndex ].id, playerData );
            //send waiting on opponent message to non-active player
            Message.sendStatic(this.getPlayerURL(activePlayerID),"waiting");
            return "success";
          break;
        case "endGame":
          //Send init message to both players ( "new game / join game" )
          Message.sendStatic(this.getPlayerURL(nonactivePlayerID),"start");
          Message.sendStatic(this.getPlayerURL(activePlayerID),"start");
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
