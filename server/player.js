/*
player.js - Defines the base object for each player.
Upon reciving the first message from a player, a new player object
should be created.
*/

var exports = module.exports = {};

exports.Player = function( userName, userID, menuState, callbackURL ){
  this.userName = userName;
  this.userID = userID;
  this.menuState = menuState;
  this.callbackURL = callbackURL;
  this.lastActive = Date.now();
};
