"use strict";
const commandList = require("./../config/commands.json");

const commandParser = commandData => {
  const userName = commandData.user_name;
  const userID = commandData.user_id;
  const menuState = "?";
  const callbackURL = commandData.response_url;
  const userData = { userName, userID, menuState, callbackURL };
  const command = commandData.text;

  switch (command) {
    case "help":
      return { gameAction: false, response: commandList.help };
      break;
    case "start":
      return { gameAction: "start", userData, response: "none" };
      break;
    case "join":
      return { gameAction: "join", userData, response: commandList.join };
      break;
    case "quit":
      return { gameAction: "quit", userData, response: "none" };
      break;
    default:
      return "ERROR";
  }
};

module.exports = commandParser;
