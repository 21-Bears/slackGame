

var exports = module.exports = {};

exports.GameObj = function( playerID, gameID ){
  this.id = gameID;
  this.players = [ playerID ];
  this.ply1Turn = true; //if ply1Turn then it's this.players[0] turn
  this.menuState = "waiting";
  this.playerData = {
    HP:[ 50, 50 ],
    loc: [ 0, 0 ],
    attackCnt: 1
  };
}

GameObj.prototype.runAttack = function( type ) {
  let curPos =this.playerData.loc[0], curPlayer = 0, opp = 1;
  if( !this.ply1Turn ){ curPos = this.playerData.loc[1]; curPlayer = 1; opp = 0; }
  let targetA = -1, targetB = -1;
  switch(type){
    case "A":
      targetA = curPos + 8;
      if(targetA >15 ){ targetA -= 16; }
      if( this.playerData.loc[ curPlayer ] === targetA ){
        this.playerData.HP[ opp ] -= 10;
        return "Hit";
      }
      else {  return "Miss";  }
    break;

    case "B":
      targetA = curPos + 5;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 5;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ curPlayer ] === targetA || this.playerData.loc[ curPlayer ] === targetB ){
        this.playerData.HP[ opp ] -= 5;
        return "Hit";
      }
      else { return "Miss"; }
    break;

    case "C":
      targetA = curPos + 4;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 4;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ curPlayer ] === targetA || this.playerData.loc[ curPlayer ] === targetB ){
        this.playerData.HP[ opp ] -= 3;
        return "Hit";
      }
      else { return "Miss"; }
    break;

    case "D":
      targetA = curPos + 1;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 1;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ curPlayer ] === targetA || this.playerData.loc[ curPlayer ] === targetB ){
        this.playerData.HP[ opp ] -= 10;
        return "Hit";
      }
      else { return "Miss"; }
    break;
  }
  return "ERROR: invalid type given to runAttack: "+type;
};

GameObj.prototype.movePlayer = function( clockwise ){
  let m = 1;
  if( !clockwise ){ m = -1; }
  if( this.ply1Turn ){
    if( this.playerData.loc[0] + m !== this.playerData.loc[1] ){ this.playerData.loc[0] += m; return "success"; }
    return "Error, player 2 at position";
  }
  else {
    if( this.playerData.loc[1] + m !== this.playerData.loc[0] ){ this.playerData.loc[1] += m; return "success"; }
    return "Error, player 1 at position";
  }
}

GameObj.prototype.addPlayer = function( playerID ){
  if(this.players.length >= 2){ return "Error: can not add player, game full."; }
  if(this.players[0] === playerID ){ return "Error: can not add player, player is already in game."; }
  this.players.push(playerID);
  return "success";
}

//At the start of a new game, GameObj.rand() should be called to randomize who gets
//first move and the location of each player

GameObj.prototype.rand = function() {
  //Randomly select who gets first move
  let r = Math.random()*10;
  if(r<5){ this.ply1Turn = true; }
  else { this.ply1Turn = false; }
  //Randomly select position for each player
  r = Math.floor(Math.random()*16);
  this.playerData.loc[0]=r;
  r += (Math.floor(Math.random()*15) || 1); //Move at least 1 space away from firt player
  if(r>15){ r -=  16; }
  this.playerData.loc[1]=r;
};
