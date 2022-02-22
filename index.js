const express = require("express"),
  app = express(),
  port = 3000;

//calling the v4 function(renamed as uuidV4) makes unique id
const { v4: uuidV4 } = require("uuid");

//set up socket.io
const socketio = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require("./modules/formatMessage");
const userJoinObject = require("./modules/manageUsers");
const router = require("./src/routes/router");
const fetch = require("node-fetch");
const axios = require("axios");
const database = require("./modules/database");

const routes = require("./src/routes/router");
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static("./public/"));
app.use("/css", express.static(__dirname + "/views/css"));
app.use("/js", express.static(__dirname + "/views/js"));
app.use("/images", express.static(__dirname + "/views/images"));

app.set("view engine", "ejs");
app.set("views", "./src/views/");

app.use("/", router);

server.listen(port, () => {
  console.log(`listening at port ${port}`);
});

const chatBot = "Chatbot";

//setup socket connection
io.on("connection", (socket) => {
  console.log(`connected (server-side) with socketId ${socket.id}`);
  //get invite code when clicked (also sets up a new room)
  socket.on("get-invite-code", (userId) => {
    const inviteCode = uuidV4();
    console.log(inviteCode);
    axios
      .post("http://localhost:3000/invite", {
        userId: userId,
        inviteCode: inviteCode,
      })
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  socket.on("storeRoom", ({ userId, pastedRoomId }) => {
    console.log(`line 47, server roomId: ${pastedRoomId}`);
    //!update database with users RoomID (after inputting invite code), then make a post request to ("/) to redirect to home page and re-render sidebar
    axios
      .post("http://localhost:3000/pastedInvite", {
        userId: userId,
        pastedRoomId: pastedRoomId,
      })
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  //user object variable
  let user = {};

  //join room (gets triggered when url is pasted)
  socket.on(
    "joinRoom",
    ({ username, roomId, roomChange, contactName, userId }) => {
      console.log(`after joingin room, userid: ${userId}`);
      console.log(`line 47, server roomId: ${roomId}`);
      //!update database with users RoomID (after inputting invite code), then make a post request to ("/) to redirect to home page and re-render sidebar
      axios
        .post("http://localhost:3000/pastedInvite", {
          username: username,
          roomId: roomId,
          roomChange: roomChange,
        })
        .then((res) => {
          console.log(`statusCode: ${res.status}`);
          console.log(res);
        })
        .catch((error) => {
          console.error(error);
        });

      // makes user object (w/id, username, room), and joins the selected room
      user = userJoinObject(socket.id, username, roomId);
      //this socket joins this particular room

      console.log(`line 63`);
      console.log(user);
      console.log(user.roomId);
      console.log(user.id);
      // console.log(socket.rooms);
      socket.join(user.roomId);
      console.log(socket.rooms); //confirms that socket is in the room

      //send joinedRoom Id to the router (so that past chats in that code can be called from the db and rendered)
      axios
        .post("http://localhost:3000/logRoomId", {
          roomId: roomId,
        })
        .then((res) => {
          console.log(`statusCode: ${res.status}`);
          console.log(res);
        })
        .catch((error) => {
          console.error(error);
        });
      //
      //
      // let messageHistory;
      // //check whether there is message history
      // const getMessageHistory = async (userId, roomId) => {
      //   console.log(`getHistory ${userId}`); // 1
      //   console.log(`getHistory ${roomId}`); // 123456789
      //   try {
      //     const checkMsgHistory = await database.any(
      //       `SELECT * FROM messages WHERE id = '${userId}' AND room_id = '${roomId}'`
      //     );
      //     console.log(`messageHistory: ${JSON.stringify(checkMsgHistory)}`);
      //     messageHistory = checkMsgHistory;
      //     console.log(`messageHistory ${messageHistory}`); // [object Object],[object Object]
      //     if (messageHistory) {
      //       console.log("message history found");
      //     } else {
      //       console.log("no messaging history found");
      //     }
      //   } catch (error) {
      //     console.log(`no messaging history found, ${error}`);
      //   }
      // };

      // getMessageHistory(userId, roomId);
      // if (checkMsgHistory) {
      //   //db call to
      //   const messageHistory = database.any(
      //     `SELECT * FROM messages WHERE room_id = '${roomId}'`
      //   );
      //   console.log(`messageHistory: ${messageHistory}`);
      // renderMessageHistory();
      // return redirect('/fortest2')->with('data', 'some data');

      //
      //
      //
      //

      //send user socket.id info to client (to disconnect from a socket when changing rooms)
      socket.emit("userSocketId", user);
      //!these messages seem to not be emitting after a room change
      socket.emit(
        "message",
        formatMessage(
          chatBot,
          `Hi ${user.username}, welcome! You've entered a chat with ${contactName}`
        ),
        user.roomID,
        roomChange
      );

      //broadcasting (sends message to all in room except the user connecting) when a user connects
      socket.broadcast
        .to(user.roomId)
        .emit(
          "message",
          formatMessage(chatBot, `${user.username} has joined the conversation`)
        ),
        user.roomId,
        roomChange;
    }
  );

  //receives chat message, formats it, and sends it to all clients in the same room
  socket.on("chatMessage", (msg, roomId, username, userId) => {
    console.log("line 138");
    console.log(msg);
    console.log(roomId);
    console.log(username);
    console.log(userId);
    axios
      .post("http://localhost:3000/storeMessage", {
        id: userId,
        msg: msg,
        room_Id: roomId,
        username: username,
        post_date: "2004-10-19",
      })
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });

    //!post request - save chat to database
    console.log(`line 92 chat to room id: ${roomId}`); //undefined currently (need to get selected roomID in here)
    console.log(`line 92 chat to room using username: ${username}`);
    // io.sockets
    //   .to(currentRoom)
    //   .emit("message", formatMessage(user.username, msg), currentRoom);
    io.to(roomId).emit("message", formatMessage(username, msg), roomId);
    console.log(msg);
  });

  //disconnects the user (socket)
  socket.on("disconnectSocket", function (userInfoForReset) {
    socket.leave(user.roomId);
  });

  //notification (server-side) that user has been disconnected
  socket.on("disconnect", () => {
    console.log("socket disconnected - confirmed server side");
  });

  // // userLeave(socket.id);
  // //10a
  // io.to(user.room).emit(
  //   "message",
  //   formatMessage(chatBot, `${user.username} has left the chat`)
  // );
  //});
});

// io.on("disconnect", () => {
//   console.log(`disconnect read on the server`);
//   socket.connect();

//   // else the socket will automatically try to reconnect
// });
