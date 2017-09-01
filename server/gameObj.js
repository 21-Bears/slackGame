

var exports = module.exports = {};

exports.GameObj = function( playerID, gameID ){
  this.id = gameID;
  this.players = [ playerID ];
  this.ply1Turn = true; //if ply1Turn then it's this.players[0] turn
  this.menuState = "waiting";
  this.attackRes = "";
  this.attack = "";
  this.powerUpPos = -1;
  this.playerData = {
    HP:[ 10, 10 ],
    loc: [ 0, 8 ],
    powerUp: [ 1, 1 ], //Used to multiply hit strength
    attackCnt: 1
  };
}

exports.GameObj.prototype.getPlayerPos = function(active){
  if(active){
    if(this.ply1Turn){ return this.playerData.loc[0]; }
    else{ return this.playerData.loc[1]; }
  }
  else {
    if(this.ply1Turn){ return this.playerData.loc[1]; }
    else{ return this.playerData.loc[0]; }
  }
}

exports.GameObj.prototype.getPlayerID = function(active){
  if(active){
    if(this.ply1Turn){ return this.players[0]; }
    else{ return this.players[1]; }
  }
  else {
    if(this.ply1Turn){ return this.players[1]; }
    else{ return this.players[0]; }
  }
}

exports.GameObj.prototype.runAttack = function( type ) {
  let curPos =this.playerData.loc[0], curPlayer = 0, opp = 1;
  if( !this.ply1Turn ){ curPos = this.playerData.loc[1]; curPlayer = 1; opp = 0; }
  let targetA = -1, targetB = -1, pow = 0;
  switch(type){
    case "A":
      targetA = curPos + 8;
      if(targetA >15 ){ targetA -= 16; }
      if( this.playerData.loc[ opp ] === targetA ){
        pow = 10 * this.playerData.powerUp[ curPlayer ];
        this.playerData.HP[ opp ] -= pow;
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); } //Reset powerUp after use
        return pow;
      }
      else {
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return 0;
      }

    break;

    case "B":
      targetA = curPos + 5;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 5;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ opp ] === targetA || this.playerData.loc[ opp ] === targetB ){
        pow = 5 * this.playerData.powerUp[ curPlayer ];
        this.playerData.HP[ opp ] -= pow;
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return pow;
      }
      else {
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return 0;
      }
    break;

    case "C":
      targetA = curPos + 4;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 4;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ opp ] === targetA || this.playerData.loc[ opp ] === targetB ){
        pow = 3 * this.playerData.powerUp[ curPlayer ];
        this.playerData.HP[ opp ] -= pow;
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return pow;
      }
      else {
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return 0;
      }
    break;

    case "D":
      targetA = curPos + 1;
      if(targetA >15 ){ targetA -= 16; }
      targetB = curPos - 1;
      if(targetB < 0 ){ targetB += 16; }
      if( this.playerData.loc[ opp ] === targetA || this.playerData.loc[ opp ] === targetB ){
        pow = 10 * this.playerData.powerUp[ curPlayer ];
        this.playerData.HP[ opp ] -= pow;
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return pow;
      }
      else {
        if( this.playerData.powerUp[ curPlayer ] !== 1 ){ this.playerData.powerUp[ curPlayer ] = 1; this.addPowerUp(); }
        return 0;
      }
    break;
  }
  return "ERROR: invalid type given to runAttack: "+type;
};

exports.GameObj.prototype.movePlayer = function( clockwise ){
  let m = 1;
  if( !clockwise ){ m = -1; }
  if( this.ply1Turn ){
    if( this.playerData.loc[0] + m !== this.playerData.loc[1] ){
      this.playerData.loc[0] += m;
      if( this.playerData.loc[0] < 0 ){ this.playerData.loc[0]+=16; }
      else if( this.playerData.loc[0] > 15 ){ this.playerData.loc[0]-=16; }
      if( this.playerData.loc[0] === this.powerUpPos ){
        this.playerData.powerUp[0] = 2;
        this.powerUpPos = -1;
        return "powerUp";
      }
      return "success";
    }
    return "Error, player 2 at position";
  }
  else {
    if( this.playerData.loc[1] + m !== this.playerData.loc[0] ){
      this.playerData.loc[1] += m;
      if( this.playerData.loc[1] < 0 ){ this.playerData.loc[1]+=16; }
      else if( this.playerData.loc[1] > 15 ){ this.playerData.loc[1]-=16; }
      if( this.playerData.loc[1] === this.powerUpPos ){
        this.playerData.powerUp[1] = 2;
        this.powerUpPos = -1;
        return "powerUp";
      }
      return "success";
    }
    return "Error, player 1 at position";
  }
}

exports.GameObj.prototype.addPlayer = function( playerID ){
  if(this.players.length >= 2){ return "Error: can not add player, game full."; }
  if(this.players[0] === playerID ){ return "Error: can not add player, player is already in game."; }
  this.players.push(playerID);
  return "success";
}

exports.GameObj.prototype.addPowerUp = function(){
  do {
    this.powerUpPos = Math.floor( Math.random()*16 );
  } while ( this.powerUpPos != this.playerData.loc[0] && this.powerUpPos != this.playerData.loc[1] );
}
//At the start of a new game, GameObj.rand() should be called to randomize who gets
//first move and the location of each player

exports.GameObj.prototype.rand = function() {
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
  this.addPowerUp();
};

exports.GameObj.prototype.checkGameOver = function(){
  if( this.playerData.HP[0] < 1 || this.playerData.HP[1] < 1 ){ return true; }
  return false;
}
