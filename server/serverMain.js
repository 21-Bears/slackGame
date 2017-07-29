//Server's main code..
"use strict";
const express = require("express");
const port = process.env.PORT || 3000;
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const commandParser = require("./commands/commandParser");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//This is used for css and asset files
app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/", function(req, res) {
  let parsed = commandParser(req.body);

  //TESTING BUTTON RESPONSE
  // if (req.body.payload) {
  //   var t = JSON.parse(req.body.payload);
  //   res.status(200).send(t.actions[0].value);
  // }

  if (parsed.gameAction === false) {
    res.status(200).send(parsed.response);
  } else if (parsed.gameAction) {
    //   //do game things
    //   //gameEngine(parsed.userData);

    res.status(200).send(`${parsed.userData.userName} wants to ${parsed.gameAction} a game.`);
  }
});

app.post("/api/*", (req, res) => {
  if (req.body.actions) {
    res.status(200).send("pizza");
  }
  let out = {
    text: "This test was *GOOD* test",
    mrkdwn: true,
    attachments: [
      {
        color: "#36a64f",
        text: JSON.stringify(req.body),
        image_url: req.protocol + "://" + req.get("host") + "/assets/sampleBoard3.png" //"https://bears21.herokuapp.com/public/assets/sampleBoard3.png"
      }
    ]
  };
  if (req.body.text) {
    out.text += " - Recived : " + req.body.text;
  }
  res.status(200).send(out);
});

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "..", "public/html/", "index.html"));
});

module.exports = app;
module.exports.port = port;
