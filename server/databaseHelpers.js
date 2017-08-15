var leaderboard = require("../leaderboardModel.js");

var DatabaseHelper = function() {
  this.queryDatabase = function() {
    return new Promise(function(resolve, reject) {
      leaderboard.find({}).exec(function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  };

  this.processGameEnd = function(UID, name, win, loss) {
    updateDatabase(UID, result).then((response, error) => {
      if (error) {
        return false;
      } else if (response === "FOUND") {
        return true;
      } else if (response === "NOT_FOUND") {
        leaderboard.schema.methods.newLeaderboardEntry(UID, name, win, loss);
      }
    });
  };

  this.updateDatabase = function(UID, win, loss) {
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
  };

  this.addToDatabase = function() {};
};

exports.DatabaseHelper = new DatabaseHelper();
