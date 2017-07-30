
var request = require('request');

var Player = require("./player.js");
var GameObj = require("./GameObj.js");

var GameData = function(){
  this.players = [];
  this.openGames = [];
  this.activeGames = [];
  this.idCnt = 0;

  this.runData = function(data){
      //1. Check if player is in this.players
      if(!data.user_id){ return "Error, user_id not in provided data: "+data; }
      var index = this.players.findIndex(cv=>{
        if( cv.user_id === data.user_id ){ return true; }
        return false;
      });
      if( index === -1 ){
        this.players.push( new Player( data.user_name, data.user_id, "init", data.response_url ) );
        //Send init message with "new Game / join game"
        return "success";
      }

      //2. Player was found, check action_value
      //Menu Functions
      switch( data.action_value ){
        case "newGame":
          this.openGames.push( new GameObj( data.user_id, this.idCnt ) );
          this.idCnt++;
          //Send waiting for opponent message
          return "success";
          break;
        case "joinList":
          var jList = this.getJoinList( 0 );
          this.players[index].menuState = "gameList0";
          //Send joinList message
          return "success";
          break;
        case "nextPage":
          var offset = ( +this.players[index].menuState.substring( 7 ) ) + 1;
          this.players[index].menuState = "gameList"+offset;
          var jList = this.getJoinList( offset );
          //Send joinList message
          return "success";
          break;
      };

      //Game logic:
      var gameID = data.action_name;
      var command = data.action_value;
      var openGamesIndex = this.openGames.findIndex( cv => { return cv.id === gameID; } );
      var activeGamesIndex = this.activeGames.findIndex( cv => { return cv.id === gameID; } );

      switch(command){
        case "join":
          if( this.openGames[ openGamesIndex ].addPlayer( data.user_id ) === "success" ){
            this.players[ index ].menuState = "inGame";
            this.players[ this.openGame[ openGamesIndex ].players[0] ].menuState = "inGame";
            this.openGame[ openGamesIndex ].rand(); //Randomize the inital settings
            this.openGame[ openGamesIndex ].menuState = "moveSelect";
            //Send active player "move Select" message
            //send non-active player "waiting on opponent" message
            this.activeGames.push( this.openGame.splice(openGamesIndex,1) ); //Remove game from openList and add it to activeList
          }
          else { //Could not join the game - This would happen if the game fills up between the time this list is given to the user and the time they clicked the button
            //Send message "Could not join game" + joinList Message
          }
          break;
        case "moveRight":
          break;
        case "moveLeft":
          break;
        case "moveRight2":
          break;
        case "moveLeft2":
          break;
        case "attackA":
          break;
        case "attackB":
          break;
        case "attackC":
          break;
        case "attackD":
          break;
        case "continue":
          break;
      };

  };

 this.getJoinList = function(offset){

 }

}();
