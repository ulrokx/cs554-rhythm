import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";

function createRoom(socket, roomName, user) {
  document.getElementById("error").innerHTML = "";
  socket.emit("createRoom", roomName, user);
}

function joinRoom(socket, roomName, user) {
  document.getElementById("error").innerHTML = "";
  socket.emit("joinRoom", roomName, user);
}

function deleteRoom(socket, roomName, user) {
  socket.emit("deleteRoom", roomName, user);
}

function leaveRoom(socket, roomName, user) {
  socket.emit("leaveRoom", roomName, user);
}

function Multiplayer() {
  const socketRef = useRef();
  const { user } = useUser();
  const [rooms, setRooms] = useState({});
  const [inRoom, setInRoom] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    //Gets updated status on the rooms
    socketRef.current.on("rooms", (rooms) => {
      setRooms(rooms);
    });

    //Error creating room
    socketRef.current.on("error", (error) => {
      document.getElementById("error").innerHTML = error;
    });

    //Success creating room
    socketRef.current.on("joinRoom", (roomName) => {
      setInRoom(true);
      setRoomName(roomName);
    });

    socketRef.current.on("leaveRoom", (_) => {
      setInRoom(false);
      setRoomName("");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
  if (inRoom) {
    return (
      <>
        <h1>{roomName}</h1>
        <h2>Room creator: {rooms[roomName].creatorName}</h2>
        {rooms[roomName].players.length ? (
          <ul>
            {rooms[roomName].players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        ) : (
          "Waiting for players to join..."
        )}
        <br></br>
        {rooms[roomName].players.length !== 0 &&
          rooms[roomName].socketId === socketRef.current.id && (
            <button>Start Game</button>
          )}
        {rooms[roomName].socketId === socketRef.current.id ? (
          <button
            onClick={() =>
              deleteRoom(socketRef.current, roomName, user.fullName)
            }
          >
            Delete Room
          </button>
        ) : (
          <button
            onClick={() =>
              leaveRoom(socketRef.current, roomName, user.fullName)
            }
          >
            Leave Room
          </button>
        )}
      </>
    );
  }
  return (
    <>
      <div id="error" className="error"></div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createRoom(
            socketRef.current,
            document.getElementById("roomName").value,
            user.fullName,
          );
        }}
      >
        <input id="roomName" type="text" placeholder="Room Name: "></input>
        <input
          type="submit"
          value="Create Room"
          className="home-game-button"
        ></input>
      </form>

      {Object.keys(rooms).map((room) => (
        <div key={room}>
          {room}
          <button
            onClick={() => joinRoom(socketRef.current, room, user.fullName)}
          >
            Join Room
          </button>
        </div>
      ))}
    </>
  );
}

export default Multiplayer;
