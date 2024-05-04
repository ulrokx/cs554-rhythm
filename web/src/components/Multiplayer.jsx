import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Game from "../components/Game";
import { useNavigate } from "react-router-dom";
import axios from "axios";

//Calculates the leaderboard of a room
function getLeaderboard(room) {
  room.sort((a, b) => b.score - a.score);
  return room;
}

function updateSocket(socket, roomName, score) {
  socket.emit("updatedScore", roomName, score);
}

function createRoom(socket, roomName, user, levelId, levels) {
  document.getElementById("error").innerHTML = "";
  for (let i = 0; i < levels.length; i++) {
    if (levels[i]._id === levelId) {
      return socket.emit("createRoom", roomName, user, levels[i]);
    }
  }
  document.getElementById("error").innerHTML = "Could not find the level specified";
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
  const [levels, setLevels] = useState(null);

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
      finalRanking.socket = socketRef.current.id;
      navigate("/ranking", { state: finalRanking });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  //Used to get the available levels for form population
  useEffect(() => {
    async function getData() {
      const {data} = await axios.get("http://localhost:4000/levels");
      setLevels(data);
    }
    getData();
  }, []);

  if (!user || !levels) {
    return <div>Loading...</div>;
  } else if (inGame) {
    return (
      <>
        <div>
          Leaderboard:
          <ul>
            {getLeaderboard(rooms[roomName].players).map((player) => (
              <li style={player.socket === socketRef.current.id ? {fontWeight: "bold"} : {}} key={player.socket}>
                {player.name} ({player.socket}) {player.score} 
              </li>
            ))}
          </ul>
        </div>
        <Game
          level={rooms[roomName].level.data}
          levelName={rooms[roomName].level.name}
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
        <h2>Level Name: {rooms[roomName].level.name}</h2>
        <h2>Room creator: {rooms[roomName].creatorName}</h2>
        Players:{" "}
        <ul>
          {rooms[roomName].players.map((player) => (
            <li style={player.socket === socketRef.current.id ? {fontWeight: "bold"} : {}} key={player.socket}>{player.name} ({player.socket})</li>
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
            user.primaryEmailAddress.emailAddress,
            document.getElementById("roomLevel").value,
            levels
          );
        }}
      >
        <input id="roomName" type="text" placeholder="Room Name: "></input>
        <select id="roomLevel">
          {levels.map((level) => (
            <option key={level._id} value={level._id}>{level.name} by {level.creator.name}</option>
          ))}
        </select>
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
            onClick={() => joinRoom(socketRef.current, room, user.primaryEmailAddress.emailAddress)}
          >
            Join Room
          </button>
        </div>
      ))}
    </>
  );
}

export default Multiplayer;
