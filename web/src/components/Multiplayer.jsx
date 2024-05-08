import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Game from "../components/Game";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { css } from "@emotion/react";
import { BeatLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
`;

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
  document.getElementById("error").innerHTML =
    "Could not find the level specified";
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
  const [loading, setLoading] = useState(true);
  const [followingCreator, setFollowingCreator] = useState(false);
  const [showFollow, setShowFollow] = useState(false);

  const follow = async (id) => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/users/follow/${id}`,
      {},
      { withCredentials: true },
    );
    setFollowingCreator(true);
  };
  const unfollow = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/users/follow/${id}`,
      { withCredentials: true },
    );
    setFollowingCreator(false);
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);

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

    setLoading(false);
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  //Used to get the available levels for form population
  useEffect(() => {
    async function getData() {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/levels`)
      setLevels(data);
    }
    getData();
  }, []);

  if (!user || !levels) {
    return (
      <div className="loading-spinner">
        <BeatLoader
          color={"#ff9933"}
          loading={loading}
          css={override}
          size={15}
        />
      </div>
    );
  } else if (inGame) {
    return (
      <>
        <div>
          Leaderboard:
          <ul>
            {getLeaderboard(rooms[roomName].players).map((player) => (
              <li
                style={
                  player.socket === socketRef.current.id
                    ? { fontWeight: "bold" }
                    : {}
                }
                key={player.socket}
              >
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
    async function configureFollowing() {
      const followingData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/following`,
        { withCredentials: true },
      );
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        { withCredentials: true },
      );
      const myData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
        { withCredentials: true },
      );
      if (
        followingData.data.find(
          ({ _id }) => _id === rooms[roomName].level.creator._id,
        )
      ) {
        setFollowingCreator(true);
      } else {
        setFollowingCreator(false);
      }
      let found = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i]._id === rooms[roomName].level.creator._id) {
          found = true;
          break;
        }
      }
      if (!found || myData.data._id === rooms[roomName].level.creator._id) {
        setShowFollow(false);
      } else {
        setShowFollow(true);
      }
    }
    configureFollowing();
    return (
      <div className="multiplayer-container">
        <h1>Multiplayer Room</h1>
        <div className="room-info">
          <p>
            <strong>Room Name:</strong> {roomName}
          </p>
          <p>
            <strong>Level Name:</strong> {rooms[roomName].level.name} (created
            by {rooms[roomName].level.creator.name})
            {showFollow &&
              (followingCreator ? (
                <button
                  className="button unfollow-button"
                  onClick={() => unfollow(rooms[roomName].level.creator._id)}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="button follow-button"
                  onClick={() => follow(rooms[roomName].level.creator._id)}
                >
                  Follow
                </button>
              ))}
          </p>
          <p>
            <strong>Room creator:</strong> {rooms[roomName].creatorName}
          </p>
          <p>
            <strong>Players:</strong>
          </p>
          <ul>
            {rooms[roomName].players.map((player) => (
              <li
                style={
                  player.socket === socketRef.current.id
                    ? { fontWeight: "bold" }
                    : {}
                }
                key={player.socket}
              >
                {player.name} ({player.socket})
              </li>
            ))}
          </ul>
        </div>
        <div className="button-container">
          {rooms[roomName].socketId === socketRef.current.id && (
            <button
              disabled={rooms[roomName].players.length <= 1}
              onClick={() => startGame(socketRef.current, roomName)}
              className="action-button"
            >
              Start Game
            </button>
          )}
          {rooms[roomName].socketId === socketRef.current.id ? (
            <button
              onClick={() => deleteRoom(socketRef.current, roomName)}
              className="action-button"
            >
              Delete Room
            </button>
          ) : (
            <button
              onClick={() => leaveRoom(socketRef.current, roomName)}
              className="action-button"
            >
              Leave Room
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="multiplayer-container">
      <h1>Multiplayer</h1>
      <div id="error" className="error"></div>
      <form
        className="create-room-form"
        onSubmit={(e) => {
          e.preventDefault();
          createRoom(
            socketRef.current,
            document.getElementById("roomName").value,
            user.primaryEmailAddress.emailAddress,
            document.getElementById("roomLevel").value,
            levels,
          );
        }}
      >
        <input
          id="roomName"
          type="text"
          placeholder="Room Name"
          className="create-room-input"
        ></input>
        <select id="roomLevel" className="create-room-select">
          {levels.map((level) => (
            <option key={level._id} value={level._id}>
              {level.name} by {level.creator.name}
            </option>
          ))}
        </select>
        <input
          type="submit"
          value="Create Room"
          className="create-room-button"
        ></input>
      </form>

      {Object.keys(rooms).map((room) => (
        <div key={room} className="room-info">
          {room}
          <div>{rooms[room].players.length} / 5</div>
          <button
            disabled={rooms[room].inGame || rooms[room].players.length >= 5}
            onClick={() =>
              joinRoom(
                socketRef.current,
                room,
                user.primaryEmailAddress.emailAddress,
              )
            }
          >
            Join Room
          </button>
        </div>
      ))}
    </div>
  );
}

export default Multiplayer;
