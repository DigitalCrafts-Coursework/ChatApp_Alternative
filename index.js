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

const chatBot = "Chatbot";

//setup socket connection
io.on("connection", (socket) => {
  console.log(`connected (server-side) with socketId ${socket.id}`);
  //get invite code when clicked (also sets up a new room)
  socket.on("get-invite-code", (username) => {
    const inviteCode = uuidV4();
    console.log(inviteCode);
    //!add this invite code (roomID) to the user's own (i.e. add roomID to username being passed = will need to pass an id (not a username))
  });

  //user object variable
  let user = {};
  //join room (gets triggered when url is pasted)
  socket.on("joinRoom", ({ username, roomID, roomChange }) => {
    console.log(`line 49, server: ${roomID}`);
    //!update database with users RoomID (after inputting invite code), then make a post request to ("/) to redirect to home page and re-render sidebar
    async () => {
      try {
        const res = await fetch("http://localhost:3000/", {
          method: "POST",
          body: "",
        });
      } catch (error) {
        console.log(error);
      }
    };
    // makes user object (w/id, username, room), and joins the selected room
    user = userJoinObject(socket.id, username, roomID);
    //this socket joins this particular room

    console.log(`line 63`);
    console.log(user);
    console.log(user.roomID);
    console.log(user.id);
    // console.log(socket.rooms);
    socket.join(user.roomID);
    console.log(socket.rooms); //confirms that socket is in the room

    //send user socket.id info to client (to disconnect from a socket when changing rooms)
    socket.emit("userSocketId", user);
    //!these messages seem to not be emitting after a room change
    socket.emit(
      "message",
      formatMessage(
        chatBot,
        `Hi ${user.username}, welcome! You've entered a chat with ...`
      ),
      user.roomID,
      roomChange
    );

    //broadcasting (sends message to all in room except the user connecting) when a user connects
    socket.broadcast
      .to(user.roomID)
      .emit(
        "message",
        formatMessage(chatBot, `${user.username} has joined the conversation`)
      ),
      user.roomID,
      roomChange;
  });

  //receives chat message, formats it, and sends it to all clients in the same room
  socket.on("chatMessage", (msg, currentRoom) => {
    console.log(msg);
    //!post request - save chat to database
    console.log(`line 92 chat to room id: ${currentRoom}`); //undefined currently (need to get selected roomID in here)
    console.log(`line 92 chat to room using username: ${user.username}`);
    // io.sockets
    //   .to(currentRoom)
    //   .emit("message", formatMessage(user.username, msg), currentRoom);
    io.to(currentRoom).emit(
      "message",
      formatMessage(user.username, msg),
      currentRoom
    );
    console.log(msg);
  });

  //disconnects the user (socket)
  socket.on("disconnectSocket", function (userInfoForReset) {
    // console.log("before disconnect");
    // socket.disconnect(userInfoForReset.id);
    // console.log("after disconnect");
    socket.leave(user.roomID);
  });

  //notification (server-side) that user has been disconnected
  socket.on("disconnect", () => {
    console.log("socket disconnected - confirmed server side");
  });

  // io.sockets.sockets.forEach((socket) => {
  //   // If given socket id is exist in list of all sockets, kill it
  //   if (userInfoForReset.id);
  //   socket.disconnect(true);
  // });
  // io.sockets.connected[userInfoForReset.id].disconnect();
  //io.sockets.sockets[].disconnect();

  // //removes user from the users array
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

const routes = require("./src/routes/router");
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
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
