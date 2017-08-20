var leaderboard = require("./leaderboardModel.js");

var exports = (module.exports = {});

var DatabaseHelper = function() {
  this.queryDatabase = function() {
    return new Promise(function(resolve, reject) {
      leaderboard.find({}).sort({'wins':-1}).limit(10).exec(function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  };

  this.queryDatabaseForUser = function() {
    return new Promise(function(resolve, reject) {
      leaderboard.find({}).sort({'wins':-1}).exec(function(err, doc) {     
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  };

  this.processGameEnd = function(UID, name, win, loss) {
    console.log('Processing game end for user: ' + name)
    this.updateDatabase(UID, win, loss).then((response, error) => {
      if (error) {
        return false;
      } else if (response === "FOUND") {
        return true;
      } else if (response === "NOT_FOUND") {
        leaderboard.schema.methods.newLeaderboardEntry(UID, name, win, loss);
        return true;
      }
    });
  };

  this.updateDatabase = function(UID, win, loss) {
    return new Promise(function(resolve, reject) {
      leaderboard.findOneAndUpdate(
        {
          UID: UID
        },
        {
          $inc: {
            wins: win,
            losses: loss
          }
        },
        function(err, doc) {
          if (err) {
            reject(err);
          } else if (doc) {
            resolve("FOUND");
          } else {
            resolve("NOT_FOUND");
          }
        }
      );
    });
  };
};

exports.DatabaseHelper = new DatabaseHelper();
