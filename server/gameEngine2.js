var { Player } = require("./player.js");
var { GameObj } = require("./gameObj.js");
var { Message } = require("./messages.js");
var { DatabaseHelper } = require("./databaseHelper.js");

var exports = module.exports = {};


var GameData = function(){

  //this.attack; // attack value
  //this.attackRes; // attack Response
  this.players = [];
  this.openGames = [];
  this.activeGames = [];
  this.idCnt = 0; //This is used to assign each game a unique ID and goes up by one every time a new game is created
  this.timerVar = setTimeout( () => { this.clearInactive(); } ,600000);
  this.buttonFunc = {
    "newGame": function(data){
      this.openGames.push( new GameObj( data.user_id, this.idCnt ) );

      this.idCnt++;
      Message.sendStatic(data.response_url,"waiting");
    },
    "joinList": function( data, index ){
      const jList = this.getJoinList( 0 );
      this.players[index].menuState = "gameList0";
      Message.sendJoinList( data.response_url , jList );
    },
    "nextPage": function( data, index ){
      const offset = ( +this.players[index].menuState.substring( 8 ) ) + 1;
      this.players[index].menuState = "gameList"+offset;
      const jList = this.getJoinList( offset );
      Message.sendJoinList( data.response_url , jList );
    },
    "quit": function( data, index ){
      this.removePlayer(data.user_id);
    },
    "join": function( data, index ){
      const openGamesIndex = this.openGames.findIndex( cv => { return ""+cv.id === data.action_name; } );
      if( this.openGames[ openGamesIndex ].addPlayer( data.user_id ) === "success" ){

        this.players[ index ].menuState = "inGame";
        this.openGames[ openGamesIndex ].rand(); //Randomize the inital settings

        const activePlayerPos = this.openGames[ openGamesIndex ].getPlayerPos(true);
        const activePlayerID = this.openGames[ openGamesIndex ].getPlayerID(true);
        const nonactivePlayerID = this.openGames[ openGamesIndex ].getPlayerID(false);

        this.openGames[ openGamesIndex ].menuState = "moveSelect";
        Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.openGames[ openGamesIndex ].id );
        Message.sendStatic(this.getPlayerURL(nonactivePlayerID),"waitingOn");
        this.activeGames.push( this.openGames.splice(openGamesIndex,1)[0] ); //Remove game from openList and add it to activeList
      }
      else { //Could not join the game - This would happen if the game fills up between the time this list is given to the user and the time they clicked the button
        const jList = this.getJoinList( 0 );
        this.players[index].menuState = "gameList0";
        Message.sendJoinList( data.response_url , jList, "Could not join game. " );
      }
    },
    "dash": function(data){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      const nonactivePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(false);
      const activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);    
      const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]
      Message.sendDashSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id, playerData);

      
    },
    // add check to send correct results
    "moveCW": function(data){
      this.moveFunction(data,true, false);

    },
    "moveCCW": function(data){
      this.moveFunction(data,false,false);
    },
    "moveCW2": function(data){
       this.moveFunction(data,true,true);
    },
    "moveCCW2": function(data){
      this.moveFunction(data,false,true);
    },
    "stay": function(data){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      let activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);
      let nonactivePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(false);
 
     // this.activeGames[ activeGamesIndex ].menuState = "results";
      this.activeGames[ activeGamesIndex ].ply1Turn = !this.activeGames[ activeGamesIndex ].ply1Turn;
      this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
      const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]

      Message.sendAttackSelect( this.getPlayerURL(nonactivePlayerID), nonactivePlayerPos , this.activeGames[ activeGamesIndex ].id, playerData );
      Message.sendStatic(this.getPlayerURL(activePlayerID),"waitingOn");


      // if(this.activeGames[ activeGamesIndex ].attackRes !== 0 ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Hit for "+this.activeGames[ activeGamesIndex ].attackRes+" damage!" ); }
      //   else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Attack "+ this.activeGames[ activeGamesIndex ].attack.toUpperCase()+ " missed!" ); }
      },
    "attackA": function(data){

      this.attackFunction(data,'a');
    },
    "attackB": function(data){
      this.attackFunction(data,'b');
    },
    "attackC": function(data){
      this.attackFunction(data,'c');
    },
    "attackD": function(data){
      this.attackFunction(data,'d');
    },
    "continue": function(data){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      const nonactivePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(false);
      const activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);    
      // this.activeGames[ activeGamesIndex ].ply1Turn = !this.activeGames[ activeGamesIndex ].ply1Turn;
      // this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
      // const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]
     
      const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]
      Message.sendMoveSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id,playerData);


      // Message.sendAttackSelect( this.getPlayerURL(nonactivePlayerID), nonactivePlayerPos , this.activeGames[ activeGamesIndex ].id, playerData );
      // Message.sendStatic(this.getPlayerURL(activePlayerID),"waitingOn");
    },
    "endGame": function(data){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      Message.sendStatic(this.getPlayerURL(nonactivePlayerID),"start");
      Message.sendStatic(this.getPlayerURL(activePlayerID),"start");
      this.activeGames.splice( activeGamesIndex, 1 ); //Delete game from activeGames list

    },
    "rematch": function( data, index){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const currentPlayerID =  data.user_id;


      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);


      if( this.players.length < 2){
        Message.sendStatic(this.getPlayerURL(currentPlayerID),"declinedRematch");
        this.openGames.pop();
        this.rematchCnt = 0;

      } else if(this.rematchCnt == 0){
        this.rematchCnt++;
           Message.sendStatic(this.getPlayerURL(currentPlayerID),"waiting");

      } else
      {
        this.rematchCnt = 0;

        const activeGame = this.activeGames[activeGamesIndex];


        this.players[ index ].menuState = "inGame";
        activeGame.rand(); //Randomize the inital settings
        activeGame.playerData.HP= [30,30];
        const activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);
        const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
        const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);

        const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]

        Message.sendAttackSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id ,playerData);
        Message.sendStatic(this.getPlayerURL(nonactivePlayerID),"waitingOn");

      }

    }
  };

  this.attackFunction = function (data, attackValue){
        const aValueUpper = attackValue.toUpperCase();
        const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
        const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
        const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
        const activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);
        this.activeGames[ activeGamesIndex ].attackRes = this.activeGames[ activeGamesIndex ].runAttack(aValueUpper);

        if( this.activeGames[ activeGamesIndex ].checkGameOver() ){

          DatabaseHelper.processGameEnd(activePlayerID, this.getPlayerName(activePlayerID), 1, 0);
          DatabaseHelper.processGameEnd(nonactivePlayerID,  this.getPlayerName(nonactivePlayerID), 0, 1);
          Message.sendGameOver( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, attackValue, this.activeGames[ activeGamesIndex ].id);
          return "success";
        }
        //send results message to both players
      this.activeGames[ activeGamesIndex ].menuState = "moveSelect";
      this.activeGames[ activeGamesIndex ].attack = attackValue;

      if(this.activeGames[ activeGamesIndex ].attackRes !== 0 ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Hit for "+this.activeGames[ activeGamesIndex ].attackRes+" damage!" ); }
        else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Attack "+ this.activeGames[ activeGamesIndex ].attack.toUpperCase()+ " missed!" ); }


      // Message.sendMoveSelect( this.getPlayerURL(activePlayerID), activePlayerPos , this.activeGames[ activeGamesIndex ].id);
      return;
  }

  this.moveFunction = function( data, clockWise, double){
      const activeGamesIndex = this.activeGames.findIndex( cv => { return  ""+cv.id === data.action_name; } );
      const activePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(true);
      const nonactivePlayerID = this.activeGames[ activeGamesIndex ].getPlayerID(false);
      let activePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(true);
      let nonactivePlayerPos = this.activeGames[ activeGamesIndex ].getPlayerPos(false);
      let res;
      this.activeGames[ activeGamesIndex ].menuState = "results";

      // if(this.activeGames[ activeGamesIndex ].attackRes !== 0 ){ Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Hit for "+this.activeGames[ activeGamesIndex ].attackRes+" damage!" ); }
      //   else { Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.activeGames[ activeGamesIndex ].attack, this.activeGames[ activeGamesIndex ].id, "Attack "+ this.activeGames[ activeGamesIndex ].attack.toUpperCase()+ " missed!" ); }
       if( double){
         res = this.activeGames[ activeGamesIndex ].movePlayer(clockWise, true);
       }
       else {
         res = this.activeGames[ activeGamesIndex ].movePlayer(clockWise,false);
     
       }
      console.log( res );
      this.activeGames[ activeGamesIndex ].ply1Turn = !this.activeGames[ activeGamesIndex ].ply1Turn;
      this.activeGames[ activeGamesIndex ].menuState = "attackSelect";
      const playerData = this.activeGames[ activeGamesIndex ].ply1Turn ?  this.activeGames[ activeGamesIndex ].playerData.HP[0] : this.activeGames[ activeGamesIndex ].playerData.HP[1]


      Message.sendAttackSelect( this.getPlayerURL(nonactivePlayerID), nonactivePlayerPos , this.activeGames[ activeGamesIndex ].id, playerData );
      Message.sendStatic(this.getPlayerURL(activePlayerID),"waitingOn");

      //Message.sendResults( this.getPlayerURL(activePlayerID), this.getPlayerURL(nonactivePlayerID), activePlayerPos, this.attack, this.activeGames[ activeGamesIndex ].id, "Attack "+ this.attack.toUpperCase()+ " missed!" );

  }

  this.clearInactive = function(){
    const cur = Date.now();
    this.players.forEach( cv => {
      if(cur - cv.lastActive > 600000){ //If player has been inactive for more then 10 min
        this.removePlayer(cv.userID);
      }
    });
    if( this.players.length > 0 ){ //If there are still players on the server
      this.timerVar = setTimeout(() => { this.clearInactive(); },300000); //Restart timer
    }
    else{ this.timerVar = null; } //Else( no players ) then clear timer var
  };

  this.resetData = function(){
    this.players.forEach( (cv)=>{ Message.sendStatic( cv.callbackURL , "goodbye" ); } );
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

  this.getPlayerName = function(id){
    let index = this.players.findIndex(cv=>{ return cv.userID === id;  });
    if( index === -1 ){ return "Error, invalid user id"; }
    return this.players[index].userName;
  }

  this.removePlayer = function(id){ //Use this when a user type '/rtb exit' or clicks exit button
      //1. Check if user is in a openGame
      let index = this.openGames.findIndex( cv => { return cv.players.some( val =>{ return val===id; }) });
      let playerIndex = -1;
      if( index!== -1 ){ //Player found in open game
          this.openGames[index].players.forEach( cv =>{
            if(cv === id){ Message.sendStatic( this.getPlayerURL(id), "goodbye" ); }
            this.openGames.splice( index, 1 );
            return;
          });
      }

      index = this.activeGames.findIndex( cv => { return cv.players.some( val =>{ return val===id; }) });
      if( index!== -1 ){ //Player found in active Game
        this.activeGames[index].players.forEach( cv =>{
          if(cv.id === id){ Message.sendStatic( this.getPlayerURL(id), "goodbye" ); }
          else {
            Message.sendStatic( this.getPlayerURL(cv), "start" );
            playerIndex = this.players.findIndex( val => { return val.id === cv; } );
            if(playerIndex!==-1){ this.players[playerIndex].menuState = "init"; }
          }
        });
        this.activeGames.splice( index, 1 );
        return;
      }
      //This only runs if the player is not in a game
      playerIndex = this.players.findIndex( val => { return val.id === id; } );
      Message.sendStatic( this.getPlayerURL(id), "goodbye" );
      this.players.splice( playerIndex, 1 );
      return;
  };

  this.runData = function(data){
      if(!data.user_id){ return "Error, user_id not in provided data: "+data; }

      const index = this.players.findIndex( cv => { return cv.userID === data.user_id });

      if( index === -1 ){
        this.players.push( new Player( data.user_name, data.user_id, "init", data.response_url ) );
        //Send init message with "new Game / join game"
        Message.sendStatic(data.response_url,"start");
        if( this.timerVar === null ){ //if timer is not already running( that only happens if there were no players )
          this.timerVar = setTimeout(() => { this.clearInactive(); },300000); //Startup timer
        }
        return `success`;
      }

      this.players[ index ].lastActive = Date.now(); //Update timer
      this.players[ index ].callbackURL =  data.response_url; //Update the res_url everytime a new message is recieved
      if( !data.action_value || !this.buttonFunc[ data.action_value ] ) { return "Error"; }
      this.buttonFunc[data.action_value].call( this, data, index );
  }

 this.getJoinList = function(offset){
   return this.openGames.slice(offset*4,(offset*4)+4).map( cv => { return cv.id; } );
 }

};


exports.GameData = new GameData();
