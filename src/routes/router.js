const express = require("express"),
  app = express(),
  router = express.Router(),
  buildUserMessagesObject = require("../../modules/userMessages.js"),
  mongoose = require("mongoose"),
  User = require("../../models/users");

mongoose.connect(
  "mongodb+srv://mvolny:47Bt988@chatappcluster.ia7qa.mongodb.net/chat_app_db?retryWrites=true&w=majority"
);

//render dashboard (homepage) using user specific data
let userID = "";
router.get("/", async (req, res) => {
  try {
    console.log(userID);
    //!4query database for the user id( return object with all info about the user (i.e. {id, username, email}, to render the home page)
    //!should be called something like "userInfo" rather than userID
    //!5a.function which queries database to find all rooms which user is a member, and all other users with these rooms
    userMessagesData = buildUserMessagesObject(userID);

    // const results = await db.any("SELECT * FROM rooms ORDER BY roomName");

    res.render("home", { userID: userID, userMessagesData: userMessagesData });
  } catch (error) {
    next(error);
  }
});

//CREATE ROOM
router.post("/", async (req, res, next) => {
  try {
    res.redirect("/");
    //location where we can post to database
  } catch (error) {
    console.log(error);
  }
});

router.get("/login", async (req, res) => {
  try {
    //!db call stored as a variable then sent out to render page
    res.render("login");
  } catch (error) {
    console.log(error);
  }
});

router.get("/signup", async (req, res) => {
  try {
    //!db call stored as a variable then sent out to render page
    res.render("signup");
  } catch (error) {
    console.log(error);
  }
});

//check username and password (hard coded for now, this will happen with a database query below)
const usernameA = "Matthew";
const passwordA = 1234;
const usernameB = "John";
const passwordB = 1234;

//checks username and password against the database and brings user to unique dashboard home page
// let userMessagesData = [];
router.post("/login", async (req, res) => {
  try {
    //!1.database query => if username and password are found (go to unique dashboard(home page) - send over username)
    const username = req.body.username;
    const password = req.body.password;
    console.log(username);
    console.log(password);
    if (
      (username == usernameA || username == usernameB) &&
      (password == passwordA || password == passwordB)
    ) {
      //!2.want a unique user id assigned here (i.e. should be an actual userId, not username)
      userID = username;
      //!3a.function which queries database to find all rooms which user is a member, and all other users with these rooms

      //        //post to database
      //     console.log(req.body);
      //     const { roomName, userID, created = "now()" } = req.body;
      //     const results = await db.none(
      //       "INSERT INTO rooms (userID, created,roomName) VALUES ($1, $2, $3)",
      //       [userID, created, roomName]
      //     );
      //     res.send(`Chatroom ${roomName} was created`);

      res.redirect("/");
    }
  } catch (error) {
    console.log(`sorry password not found, ${error}`);
  }
});

//DELETE ROOM
router.post("/:roomName", async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const results = await db.none(
      "DELETE FROM rooms WHERE roomName=($1)",
      roomName
    );
    res.send(`Chatroom ${roomName} was deleted`);
  } catch (error) {
    next(error);
  }
});

//NOT COMPLETE OLD CODE
app.post("/user", (req, res) => {
  const { userID, userName } = req.body;
  db.none("INSERT INTO users (userID, userName) VALUES ($1, $2)", [
    userID,
    userName,
  ]).then(() => {
    console.log(`User ${userName} was created`);
    res.send("User created");
  });
});

//ERROR HANDLING
app.use((err, req, res, next) => {
  res.send("something went wrong");
});

module.exports = router;
