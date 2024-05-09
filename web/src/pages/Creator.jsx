import axios from "axios";
import Requests from "../services/requests";
import { useAuth } from "@clerk/clerk-react";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameEditor from "../components/GameEditor";
import { round } from "../services/helpers";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaFileUpload } from "react-icons/fa";

export default function Creator({ ...props }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const params = useParams();
  const authData = useAuth();
  const navigate = useNavigate();
  const [allLevels, setLevels] = useState([]);
  const [uploadedSong, setUploadedSong] = useState(undefined);
  const [songData, setSongData] = useState(undefined);
  const [renderFlag, setFlag] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const songTime = useRef(0);
  const playerRef = useRef();
  const [errorState, setError] = useState("");
  const songUrl = useMemo(() => {
    if (songData) return BACKEND_URL + "/levels/" + "song/" + songData.id;
    else return undefined;
  }, [songData]);

  async function handleSubmit(event) {
    const target = event.target;
    event.preventDefault();
    //Make formdata
    const formData = new FormData();
    const trimmedName = target[0].value.trim();
    if(trimmedName.length === 0){
      setError("Name cannot be empty")
      return;
    }
    else if(!target[1].files[0]){
      setError("You must upload a file");
      return;
    }
    formData.append("name", target[0].value.trim());
    formData.append("userId", authData.userId);
    formData.append("song", target[1].files[0]);
    const songPost = await axios.post(BACKEND_URL + "/levels/", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    setError("");
    navigate(`/creator/${songPost.data._id}`);
  }

  function setSongDataFromInput(data) {
    const r = {
      id: data._id,
      levelData: data.data,
      name: data.name,
      songPath: data.songPath,
      published: data.published,
    };
    setSongData({ ...r });
  }

  async function handleSave(id, name, data, newPublished, setState = true) {
    //Make sure all data times are rounded
    const roundedTimes = data.map((e) => [
      e[0],
      round(e[1], 2),
      e[2].toLowerCase(),
      e[3],
    ]);
    const res = await axios.put(
      BACKEND_URL + "/levels/" + id,
      {
        data: roundedTimes,
        name: name,
        published: newPublished,
      },
      { withCredentials: true },
    );
    if (setState) setSongDataFromInput(res.data);
  }

  useEffect(() => {
    async function getLevel(id) {
      const { data } = await axios.get(BACKEND_URL + "/levels/" + id, {
        withCredentials: true,
      });
      console.log(data);
      // setSongData({id: data._id, levelData: data.data, name: data.name, songPath: data.songPath, published: data.published});
      setSongDataFromInput(data);
    }
    async function getUserLevels() {
      if (!params.id) {
        const { data } = await axios.get(BACKEND_URL + "/levels/mylevels", {
          withCredentials: true,
        });
        console.log(data);
        setLevels(data);
      }
    }

    if (params.id) getLevel(params.id);
    else {
      getUserLevels();
      setSongData(undefined);
      setUploadedSong(undefined);
    }
  }, [params.id]);

  if (!songData)
    return (
      <div className="creator_menu">
        <div>
          <h1>Your Levels</h1>
          {allLevels.length === 0 ? (
            <>You have created no levels. Get started below!</>
          ) : (
            allLevels.map((e, i) => (
              <div key={i} className="custom_level">
                <h3
                  style={{
                    display: "inline-block",
                    width: "50%",
                    textAlign: "left",
                    fontSize: "18pt",
                    margin: ".5rem",
                  }}
                >
                  {e.name}
                </h3>
                <button
                  className="creator_button"
                  onClick={async () => {
                    await handleSave(
                      e._id,
                      e.name,
                      e.data,
                      !e.published,
                      false,
                    );
                    setLevels((l) =>
                      l.map((k, i2) =>
                        i === i2 ? { ...k, published: !k.published } : { ...k },
                      ),
                    );
                  }}
                >
                  {e.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  className="creator_button"
                  onClick={() => navigate(`/creator/${e._id}`)}
                >
                  Open
                </button>
              </div>
            ))
          )}
        </div>
        <div>
          <h2>Create a new Level</h2>
          <form onSubmit={handleSubmit} method="POST" id="fileUploadForm">
            <label style={{ fontSize: "14pt" }}>
              Level Name (Can be changed later):{" "}
              <input
                type="text"
                name="level_name"
                style={{
                  background: "transparent",
                  color: "black",
                  fontSize: "12pt",
                  borderRadius: "5px",
                }}
              />
            </label>
            <br />
            <br />

            <label id="fileUploadLabel">
              {uploadedSong ? (
                <>Current Song: {uploadedSong}</>
              ) : (
                <>
                  <FaFileUpload /> Upload your Song
                </>
              )}
              <input
                type="file"
                name="fileUpload"
                accept=".mp3,.ogg,.wav,.avi,.mp4,.mov,.flac,.m4a"
                id="fileUpload"
                onChange={(s) => {
                  setUploadedSong(s.target.value.split("\\").pop());
                }}
              />
            </label>
            <br />
            <br />
            <button type="submit">Create</button>
            <p  hidden={errorState.length === 0} style={{color: "red"}}>{errorState}</p>
          </form>
        </div>
      </div>
    );
  else {
    return (
      <div style={{ padding: "1rem", margin: "1rem" }}>
        {editingTitle ? (
          <div style={{ textAlign: "center" }}>
            <form
              onSubmit={(e) => {
                const target = e.target[0];
                e.preventDefault();
                setSongData({ ...songData, name: target.value.trim() });
                setEditingTitle(false);
              }}
            >
              <input
                defaultValue={songData.name}
                type="text"
                style={{
                  background: "transparent",
                  border: "1px solid #213547",
                  textAlign: "center",
                  borderRadius: "5px",
                  color: "#ff9933",
                  fontSize: "3.2em",
                  lineHeight: "1.1",
                  fontWeight: "bold",
                  margin: "2rem 0",
                }}
              />
            </form>
          </div>
        ) : (
          <h1 style={{ textAlign: "center", margin: "2rem 0" }}>
            {songData.name}{" "}
            <span hidden={editingTitle}>
              <FaEdit
                style={{ color: "black", cursor: "pointer" }}
                onClick={() => setEditingTitle(true)}
              />
            </span>
          </h1>
        )}
        <GameEditor
          running={playing}
          renderFlag={renderFlag}
          levelData={songData.levelData}
          timestamp={songTime.current}
          isPublished={songData.published}
          onSave={(d) =>
            handleSave(songData.id, songData.name, d, songData.published)
          }
          onPublish={(d) =>
            handleSave(songData.id, songData.name, d, !songData.published)
          }
          playerRef={playerRef}
        />
        <br />
        <AudioPlayer
          style={{ width: "75%", bottom: "0", position: "fixed", left: "15%"}}
          src={songUrl}
          showSkipControls={false}
          showJumpControls={false}
          hasDefaultKeyBindings={false}
          autoPlayAfterSrcChange={false}
          listenInterval={1}
          volume={0.5}
          onSeeked={() => setFlag(!renderFlag)}
          ref={playerRef}
          onListen={(e) => {
            songTime.current = e.target.currentTime;
          }}
          onPlay={() => {
            setPlaying(true);
          }}
          onPause={() => {
            setPlaying(false);
          }}
        />
      </div>
    );
  }
}
