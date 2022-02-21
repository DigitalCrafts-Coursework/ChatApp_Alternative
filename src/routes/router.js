// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri =
//   "mongodb+srv://mvolny:47Bt988@chatappcluster.ia7qa.mongodb.net/chat_app_db?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("connected");
//   client.close();
// });

const express = require("express"),
  app = express(),
  router = express.Router(),
  pgPromise = require("pg-promise")(),
  buildUserMessagesObject = require("../../modules/userMessages.js");
//   mongoose = require("mongoose"),
//   User = require("../../models/users");

// mongoose.connect(
//   "mongodb+srv://mvolny:47Bt988@chatappcluster.ia7qa.mongodb.net/chat_app_db?retryWrites=true&w=majority"
// );

const config = {
  host: "localhost",
  port: 5432,
  database: "chatApp",
  user: "matthewvolny",
  password: "Ronweasley1@@@",
};

const database = pgPromise(config);

//render dashboard (homepage) using user specific data
let userID = "";
router.get("/", async (req, res) => {
  try {
    console.log(`line 42, userID: ${userID}`);
    //!4query database for the user id( return object with all info about the user (i.e. {id, username, email}, to render the home page)
    //!should be called something like "userInfo" rather than userID
    //!5a.function which queries database to find all rooms which user is a member, and all other users with these rooms
    userMessagesData = buildUserMessagesObject(userID);

    // const results = await db.any("SELECT * FROM rooms ORDER BY roomName");

    res.render("home", { userID: userID, userMessagesData: userMessagesData });
  } catch (error) {
    console.log(error);
  }
});

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
// const usernameA = "Matthew";
// const passwordA = 1234;
// const usernameB = "John";
// const passwordB = 1234;

//checks db for username and password and redirects to the home page
router.post("/login", async (req, res) => {
  const username = req.body.username,
    password = req.body.password;
  try {
    const loginAttempt = await database.any(
      `SELECT * FROM users WHERE username = '${username}' AND user_password = '${password}'`
    );
    if (loginAttempt) {
      console.log(loginAttempt[0].id);
      console.log(loginAttempt[0].username);
      console.log(loginAttempt[0].user_password);
      console.log(loginAttempt[0].email);
      //!2.want a unique user id assigned here (i.e. should be an actual userId, not username)
      userID = loginAttempt[0].id;
      userDetails = loginAttempt;
      res.redirect("/");
    }
  } catch (error) {
    console.log(`sorry password not found, ${error}`);
  }
});

//create user
router.post("/signup", async (req, res) => {
  const username = req.body.username,
    password = req.body.password,
    email = req.body.email,
    src = req.body.src;
  console.log(src); //coming up null
  try {
    let queryString =
      "INSERT INTO users (username, user_password, email, src) VALUES ($1, $2, $3, $4)";
    await database.none(queryString, [username, password, email, src]);
    //could redirect to another page for a moment (confirming registration, then redirect to /login)
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

//await models.Task.create({ task: req.body.task });

module.exports = router;
