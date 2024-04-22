import app from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const rooms = {}; //key is roomName, value is {creator "" and players ["str"]}

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  //Sends rooms status to client
  socket.emit("rooms", rooms);

  //Client sends request to create a room
  socket.on("createRoom", (roomName, user) => {
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
      players: [],
      playerIds: [],
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

    //Joins room
    rooms[roomName].players.push(user);
    rooms[roomName].playerIds.push(socket.id);
    io.sockets.emit("rooms", rooms);
    socket.join(roomName);
    socket.emit("joinRoom", roomName);
  });

  socket.on("deleteRoom", (roomName, user) => {
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

  socket.on("leaveRoom", (roomName, user) => {
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
    socket.emit("leaveRoom");
    io.sockets.emit("rooms", rooms);
  });

  socket.on("disconnect", () => {
    //Updates the rooms of the leaving client
    for (const [roomName, room] of Object.entries(rooms)) {
      if (room.playerIds.includes(socket.id)) {
        //Removes client from any rooms they were in
        const idx = room.playerIds.indexOf(socket.id);
        const updatedPlayers = room.players.toSpliced(idx, 1);
        const updatedPlayerIds = room.playerIds.toSpliced(idx, 1);
        console.log(updatedPlayers);
        rooms[roomName].players = updatedPlayers;
        rooms[roomName].playerIds = updatedPlayerIds;
        io.sockets.emit("rooms", rooms);
      } else if (room.socketId === socket.id) {
        //Deletes room if client was the room creator
        delete rooms[roomName];
        io.to(roomName).emit("leaveRoom");
        io.in(roomName).socketsLeave();
        io.sockets.emit("rooms", rooms);
      }
    }
    console.log("client disconnected", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});
