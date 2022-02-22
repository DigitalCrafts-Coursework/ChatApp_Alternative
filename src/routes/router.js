const express = require("express"),
  app = express(),
  router = express.Router(),
  pgPromise = require("pg-promise")();
//buildUserMessagesObject = require("../../modules/userMessages.js");

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

  const firstVisitCheck = await database.any(
    `SELECT * FROM rooms WHERE id = '${loggedInUser[0].id}'`
  );

  console.log(firstVisitCheck);
  //if statement checks for first time logging in
  if (firstVisitCheck == "") {
    try {
      res.render("home", {
        loggedInUser: loggedInUser,
        contacts: [],
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const combinedTables = await database.any(
        `SELECT * FROM users NATURAL JOIN rooms`
      );
      console.log(combinedTables);

      //1 would be my loggedInUser[0].id
      let myRooms = [];
      for (let i = 0; i < combinedTables.length; i++) {
        if (combinedTables[i].id === loggedInUser[0].id) {
          myRooms.push(combinedTables[i].room_id);
        }
      }
      console.log(myRooms);

      //
      let otherUsersRooms = [];
      for (let i = 0; i < combinedTables.length; i++) {
        if (combinedTables[i].id !== loggedInUser[0].id) {
          otherUsersRooms.push(combinedTables[i].room_id);
        }
      }
      console.log(otherUsersRooms);

      //
      let sharedRooms = [];
      for (let i = 0; i < otherUsersRooms.length; i++) {
        for (let j = 0; j < myRooms.length; j++) {
          if (otherUsersRooms[i] === myRooms[j]) {
            sharedRooms.push(otherUsersRooms[i]);
          }
        }
      }
      console.log(sharedRooms);

      //
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
      console.log(contactInfo);

      res.render("home", {
        loggedInUser: loggedInUser,
        contactInfo: contactInfo,

        // for (let i = 0; i < sharedRooms.length; i++) {
        //   `SELECT * FROM <JOINED ROOMS> WHERE room_id = '${myRooms[i].room_id}' AND id != '${loggedInUser[0].id}'`;
        // }
        // const ContactInfo = await database.any(
        //   `SELECT * FROM users NATURAL JOIN rooms`
        // );

        //

        // console.log(`line 66 ${sharedRooms[0].id}`);
        // sharedRooms.forEach(async (sharedRoom) => {
        //   const correspondingContactInfo = await database.any(
        //     `SELECT * FROM users WHERE id = '${sharedRoom[0].id}'`
        //   );
        //   console.log(`sharedRoom user info ${correspondingContactInfo}`);
        //   const toJSON = JSON.stringify(correspondingContactInfo);
        //   console.log(toJSON);
        // });

        //!5a.function which queries database to find all rooms which user is a member, and all other users with these rooms
        //userMessagesData = buildUserMessagesObject(loggedInUser[0].id);
      });
    } catch (error) {
      console.log(error);
    }
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
