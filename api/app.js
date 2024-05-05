import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createUser } from "./src/data/users.js";
import cors from "cors";
import { createLevel } from "./src/data/levels.js";
import usersRouter from "./src/routes/users.js";
import levelsRouter from "./src/routes/levels.js";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const rooms = {}; //key is roomName, value is {creatorName: string, socketId: socketId and playerIds [socketId] and players [{name: str, score: int}] and level: {Level Object} and inGame bool and finished bool}

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  //Sends rooms status to client
  socket.emit("rooms", rooms);

  //Client sends request to create a room
  socket.on("createRoom", (roomName, user, level) => {
    //Invalid room name length
    if (roomName.length < 2 || roomName.length > 20) {
      return socket.emit(
        "error",
        "The room name must be between 2 and 20 characters long",
      );
    }

    //Empty room name
    if (roomName.trim() === "") {
      return socket.emit(
        "error",
        "The room name cannot be empty or only spaces",
      );
    }

    //If the room name already exists
    if (rooms.hasOwnProperty(roomName)) {
      return socket.emit(
        "error",
        "A room already exists with the name '" + roomName + "'",
      );
    }

    //Create room
    rooms[roomName] = {
      creatorName: user,
      socketId: socket.id,
      players: [{ name: user, score: 0, socket: socket.id }],
      playerIds: [socket.id],
      level,
      inGame: false,
      finished: false,
    };
    io.sockets.emit("rooms", rooms);
    socket.join(roomName);
    socket.emit("joinRoom", roomName);
  });

  //Client sends request to join a room
  socket.on("joinRoom", (roomName, user) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return socket.emit(
        "error",
        "Could not find a room with the name '" + roomName + "'",
      );
    }

    //Checks if room if full
    if (rooms[roomName].players.length === 5) {
      return socket.emit("error", "Room is full");
    }

    //Joins room
    rooms[roomName].players.push({ name: user, score: 0, socket: socket.id });
    rooms[roomName].playerIds.push(socket.id);
    rooms[roomName].activePlayers++;
    io.sockets.emit("rooms", rooms);
    socket.join(roomName);
    socket.emit("joinRoom", roomName);
  });

  socket.on("deleteRoom", (roomName) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return;
    }

    //Only creator can delete the room
    if (rooms[roomName].socketId !== socket.id) {
      return;
    }

    //Deletes the room
    delete rooms[roomName];
    io.to(roomName).emit("leaveRoom");
    io.in(roomName).socketsLeave();
    io.sockets.emit("rooms", rooms);
  });

  socket.on("leaveRoom", (roomName) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return;
    }

    //Creator cannot leave the room (can only delete)
    if (rooms[roomName].socketId === socket.id) {
      return;
    }

    //Makes sure player is in the room
    if (!rooms[roomName].playerIds.includes(socket.id)) {
      return;
    }

    //Leaves the room
    const idx = rooms[roomName].playerIds.indexOf(socket.id);
    rooms[roomName].players.splice(idx, 1);
    rooms[roomName].playerIds.splice(idx, 1);
    rooms[roomName].activePlayers--;
    socket.emit("leaveRoom");
    io.sockets.emit("rooms", rooms);
  });

  socket.on("startGame", (roomName) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return;
    }

    //Only the creator of the room can start the game
    if (rooms[roomName].socketId !== socket.id) {
      return;
    }

    //Makes sure the room has enough players to start
    if (rooms[roomName].players.length < 2) {
      return;
    }

    //Starts the game
    rooms[roomName].inGame = true;
    io.to(roomName).emit("startGame");
    io.sockets.emit("rooms", rooms);
  });

  socket.on("updatedScore", (roomName, score) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return;
    }

    //Makes sure player is in the room
    if (!rooms[roomName].playerIds.includes(socket.id)) {
      return;
    }

    //Updates the score
    const idx = rooms[roomName].playerIds.indexOf(socket.id);
    rooms[roomName].players[idx].score = score;
    io.sockets.emit("rooms", rooms);
  });

  socket.on("endGame", (roomName) => {
    //Makes sure room exists
    if (!rooms.hasOwnProperty(roomName)) {
      return;
    }

    //Makes sure player is in the room
    if (!rooms[roomName].playerIds.includes(socket.id)) {
      return;
    }

    //Updates player to be finished
    const idx = rooms[roomName].playerIds.indexOf(socket.id);
    rooms[roomName].players[idx].finished = true;

    //Checks if all players are finished
    let allFinished = true;
    for (let i = 0; i < rooms[roomName].players.length; i++) {
      if (!rooms[roomName].players[i].finished) {
        allFinished = false;
        break;
      }
    }
    if (allFinished) {
      io.to(roomName).emit("allFinished", rooms[roomName].players);
    }
  });

  socket.on("disconnect", () => {
    //Updates the rooms of the leaving client
    for (const [roomName, room] of Object.entries(rooms)) {
      if (
        (room.socketId === socket.id && !room.inGame) ||
        (room.playerIds.includes(socket.id) && room.players.length === 1)
      ) {
        //Deletes room if client was the room creator (not in game) or if it is the last player
        delete rooms[roomName];
        io.to(roomName).emit("leaveRoom");
        io.in(roomName).socketsLeave();
        io.sockets.emit("rooms", rooms);
      } else if (room.playerIds.includes(socket.id)) {
        //Removes client from any rooms they were in
        const idx = room.playerIds.indexOf(socket.id);
        const updatedPlayers = room.players.toSpliced(idx, 1);
        const updatedPlayerIds = room.playerIds.toSpliced(idx, 1);
        rooms[roomName].players = updatedPlayers;
        rooms[roomName].playerIds = updatedPlayerIds;
        io.sockets.emit("rooms", rooms);

        //Checks if all players are finished after the other player left
        if (room.inGame) {
          let allFinished = true;
          for (let i = 0; i < rooms[roomName].players.length; i++) {
            if (!rooms[roomName].players[i].finished) {
              allFinished = false;
              break;
            }
          }
          if (allFinished) {
            io.to(roomName).emit("allFinished");
          }
        }
      }
    }
    console.log("client disconnected", socket.id);
  });
});

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.route("/webhook").post(async (req, res) => {
  console.log("webhook received");
  switch (req.body.type) {
    case "user.created": {
      console.log("new user!");
      await createUser(req.body.data);
      break;
    }
    default: {
      console.log(`unhandled event type: ${req.body.type}`);
    }
  }
  res.status(200).send();
});

app.route("/seed").post(async (req, res) => {
  const fakeUser = await createUser({
    id: "9+10=21",
    email_addresses: [{ email_address: "lol@gmail.com" }],
    first_name: "Poop",
    last_name: "Face2",
  });
  req.body.user = fakeUser;
  await createLevel(req.body);
});

app.use("/levels", levelsRouter);
app.use("/users", usersRouter);

httpServer.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});
