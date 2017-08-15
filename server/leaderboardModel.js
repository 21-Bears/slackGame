const mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;

//leaderboard schema
var leaderboardSchema = mongoose.Schema({
  _id: String,
  UID: String,
  name: String,
  wins: Number,
  losses: Number
});

//Create new leaderboard entry
leaderboardSchema.methods.newLeaderboardEntry = function(UID, name, wins, losses) {
  var newEntry = new leaderboardModel({
    _id: new ObjectID(),
    UID: UID,
    nameame: name,
    wins: wins,
    losses: losses
  });

  newEntry.save(function(err) {
    if (err) {
      throw err;
    } else {
      return "success";
    }
  });
};

var leaderboardModel = mongoose.model("leaderboardEntry", leaderboardSchema, "leaderboard");
module.exports = leaderboardModel;
