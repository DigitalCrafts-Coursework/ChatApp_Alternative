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
let loggedInUser = "";
router.get("/", async (req, res) => {
  console.log(`line 42, userID: ${loggedInUser[0].username}`);
  try {
    const myRooms = await database.any(
      `SELECT * FROM rooms WHERE id = '${loggedInUser[0].id}'`
    );

    console.log(`my rooms are ${myRooms[0].room_id}`);
    console.log(`my rooms are ${myRooms[1].room_id}`);
    console.log(`my rooms are ${myRooms[2].room_id}`);
    console.log(`my rooms are ${myRooms[3].room_id}`);

    const sharedRooms = [];
    console.log(`line 53: ${loggedInUser[0].id}`); // 1
    for (let i = 0; i < myRooms.length; i++) {
      const sharedRoom = await database.any(
        `SELECT * FROM rooms WHERE room_id = '${myRooms[i].room_id}' AND id != '${loggedInUser[0].id}'`
      );
      sharedRooms.push(sharedRoom);
      console.log("one loop");
    }

    for (let i = 0; i < sharedRooms.length; i++) {
      console.log(`${sharedRooms[i].id} and ${sharedRooms[i].room_id}`);
    }

    const str = JSON.stringify(sharedRooms);
    console.log(str);
    console.log(`these are users sharing a room with me ${sharedRooms}`);
    console.log(`these are users sharing a room with me ${sharedRooms[0]}`);
    console.log(`these are users sharing a room with me ${sharedRooms[0].id}`);
    //!should be called something like "userInfo" rather than userID
    //!5a.function which queries database to find all rooms which user is a member, and all other users with these rooms
    userMessagesData = buildUserMessagesObject(loggedInUser[0].id);

    // const results = await db.any("SELECT * FROM rooms ORDER BY roomName");

    res.render("home", {
      loggedInUser: loggedInUser,
      userMessagesData: userMessagesData,
    });
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
      loggedInUser = loginAttempt;
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

//add invite roomId code to the database
router.post("/invite", async (req, res) => {
  const userId = req.body.userId,
    inviteCode = req.body.inviteCode;
  console.log(`line 130 ${req.body.userId}`);
  console.log(`line 132 ${req.body.inviteCode}`);
  try {
    let queryString = "INSERT INTO rooms (id, room_id) VALUES ($1, $2)";
    await database.none(queryString, [userId, inviteCode]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

//add invite roomId code to the database
router.post("/pastedInvite", async (req, res) => {
  const userId = req.body.userId,
    pastedRoomId = req.body.pastedRoomId;
  console.log(`line 130 ${userId}`);
  console.log(`line 132 ${pastedRoomId}`);
  try {
    let queryString = "INSERT INTO rooms (id, room_id) VALUES ($1, $2)";
    await database.none(queryString, [userId, pastedRoomId]);
    // res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

//await models.Task.create({ task: req.body.task });

module.exports = router;
