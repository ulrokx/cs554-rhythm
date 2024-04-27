import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Game from "../components/Game";
import { useNavigate } from "react-router-dom";

//Calculates the leaderboard of a room
function getLeaderboard(room) {
  room.sort((a, b) => b.score - a.score);
  return room;
}

function updateSocket(socket, roomName, score) {
  socket.emit("updatedScore", roomName, score);
}

function createRoom(socket, roomName, user) {
  document.getElementById("error").innerHTML = "";
  socket.emit("createRoom", roomName, user);
}

function joinRoom(socket, roomName, user) {
  document.getElementById("error").innerHTML = "";
  socket.emit("joinRoom", roomName, user);
}

function deleteRoom(socket, roomName) {
  socket.emit("deleteRoom", roomName);
}

function leaveRoom(socket, roomName) {
  socket.emit("leaveRoom", roomName);
}

function startGame(socket, roomName) {
  socket.emit("startGame", roomName);
}

function endGame(socket, roomName) {
  socket.emit("endGame", roomName);
}

function Multiplayer() {
  const socketRef = useRef();
  const navigate = useNavigate();
  const { user } = useUser();
  const [rooms, setRooms] = useState({});
  const [inRoom, setInRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [inGame, setInGame] = useState(false);

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

    //Leaves the room
    socketRef.current.on("leaveRoom", (_) => {
      setInRoom(false);
      setRoomName("");
    });

    //Game started
    socketRef.current.on("startGame", (_) => {
      setInGame(true);
    });

    //Game ended, send players to rankings page
    socketRef.current.on("allFinished", (room) => {
      const finalRanking = getLeaderboard(room);
      navigate("/ranking", { state: finalRanking });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  } else if (inGame) {
    return (
      <>
        <div>
          Leaderboard:
          <ul>
            {getLeaderboard(rooms[roomName].players).map((player) => (
              <li key={player.socket}>
                {player.name} {player.score}
              </li>
            ))}
          </ul>
        </div>
        <Game
          multiplayer={true}
          updateScore={(score) =>
            updateSocket(socketRef.current, roomName, score)
          }
          finishGame={() => endGame(socketRef.current, roomName)}
        ></Game>
      </>
    );
  } else if (inRoom) {
    return (
      <>
        <h1>{roomName}</h1>
        <h2>Room creator: {rooms[roomName].creatorName}</h2>
        Players:{" "}
        <ul>
          {rooms[roomName].players.map((player) => (
            <li key={player.socket}>{player.name}</li>
          ))}
        </ul>
        <br></br>
        {rooms[roomName].socketId === socketRef.current.id && (
          <button
            disabled={rooms[roomName].players.length <= 1}
            onClick={() => startGame(socketRef.current, roomName)}
          >
            Start Game
          </button>
        )}
        {rooms[roomName].socketId === socketRef.current.id ? (
          <button onClick={() => deleteRoom(socketRef.current, roomName)}>
            Delete Room
          </button>
        ) : (
          <button onClick={() => leaveRoom(socketRef.current, roomName)}>
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
          <div>{rooms[room].players.length} / 5</div>
          <button
            disabled={rooms[room].inGame || rooms[room].players.length >= 5}
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
