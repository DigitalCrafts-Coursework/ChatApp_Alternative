const express = require("express"),
  app = express(),
  router = express.Router(),
  pgPromise = require("pg-promise")();
//buildUserMessagesObject = require("../../modules/userMessages.js");

const database = require("../../modules/database");

// const config = {
//   host: "localhost",
//   port: 5432,
//   database: "chatApp",
//   user: "matthewvolny",
//   password: "Ronweasley1@@@",
// };

// const database = pgPromise(config);

//joinedRoom
let joinedRoom = "";

//render dashboard (homepage) using user specific data
let loggedInUser = "";
router.get("/", async (req, res) => {
  // console.log(`line 42, userID: ${loggedInUser[0].username}`);

  const firstVisitCheck = await database.any(
    `SELECT * FROM rooms WHERE id = '${loggedInUser[0].id}'`
  );

  console.log(firstVisitCheck);
  //if statement checks for first time logging in
  if (firstVisitCheck == "") {
    try {
      res.render("home", {
        loggedInUser: loggedInUser,
        contactInfo: [],
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const combinedTables = await database.any(
        `SELECT * FROM users NATURAL JOIN rooms`
      );

      let myRooms = [];
      for (let i = 0; i < combinedTables.length; i++) {
        if (combinedTables[i].id === loggedInUser[0].id) {
          myRooms.push(combinedTables[i].room_id);
        }
      }

      let otherUsersRooms = [];
      for (let i = 0; i < combinedTables.length; i++) {
        if (combinedTables[i].id !== loggedInUser[0].id) {
          otherUsersRooms.push(combinedTables[i].room_id);
        }
      }

      let sharedRooms = [];
      for (let i = 0; i < otherUsersRooms.length; i++) {
        for (let j = 0; j < myRooms.length; j++) {
          if (otherUsersRooms[i] === myRooms[j]) {
            sharedRooms.push(otherUsersRooms[i]);
          }
        }
      }

      let contactInfo = [];
      for (let i = 0; i < combinedTables.length; i++) {
        for (let j = 0; j < sharedRooms.length; j++) {
          if (
            combinedTables[i].room_id === sharedRooms[j] &&
            combinedTables[i].id !== loggedInUser[0].id
          ) {
            contactInfo.push(combinedTables[i]);
          }
        }
      }
      // console.log(contactInfo);
      //

      //
      console.log(`joined room ${joinedRoom}`);
      //check if user has messages in a particular room
      const messagesFromSpecificRoom = await database.any(
        `SELECT * FROM users NATURAL JOIN messages WHERE room_id = '${joinedRoom}'`
      );

      let messages = [];
      for (let i = 0; i < messagesFromSpecificRoom.length; i++) {
        // if (combinedTables[i].id === loggedInUser[0].id) {
        messages.push(messagesFromSpecificRoom[i].message_content);
        // }
      }
      console.log(`messages array ${messages}`);

      //
      //
      //

      res.render("home", {
        loggedInUser: loggedInUser,
        contactInfo: contactInfo,
      });
    } catch (error) {
      console.log(error);
    }
  }
});

router.post("/storeMessage", async (req, res) => {
  const id = req.body.id,
    msg = req.body.msg,
    postDate = req.body.post_date,
    roomId = req.body.room_Id;
  // console.log(`id: ${id}`);
  // console.log(`msg: ${msg}`);
  // console.log(`post_date: ${post_date}`);
  try {
    let queryString =
      "INSERT INTO messages (id, message_content, room_id) VALUES ($1, $2, $3)";
    await database.none(queryString, [id, msg, roomId]);
    //could redirect to another page for a moment (confirming registration, then redirect to /login)
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
      // console.log(loginAttempt[0].id);
      // console.log(loginAttempt[0].username);
      // console.log(loginAttempt[0].user_password);
      // console.log(loginAttempt[0].email);
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
  console.log(`src ${src}`); //coming up null
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
  // console.log(`line 130 ${req.body.userId}`);
  // console.log(`line 132 ${req.body.inviteCode}`);
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
  // console.log(`line 130 ${userId}`);
  // console.log(`line 132 ${pastedRoomId}`);
  try {
    let queryString = "INSERT INTO rooms (id, room_id) VALUES ($1, $2)";
    await database.none(queryString, [userId, pastedRoomId]);
    // res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

//checks db for username and password and redirects to the home page
router.post("/logRoomId", (req, res) => {
  joinedRoom = req.body.roomId;
  console.log(`req body roomid ${joinedRoom}`);
  res.redirect("/");
});

module.exports = router;
