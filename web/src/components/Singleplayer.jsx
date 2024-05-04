import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Singleplayer() {
  const [levels, setLevels] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const { data } = await axios.get("http://localhost:4000/levels");
      setLevels(data);
    }
    getData();
  }, []);

  if (!levels) {
    return <>Loading...</>;
  } else {
    return (
      <>
        <h1>Pick your level</h1>
        {levels.map((level) => (
          <div key={level._id}>
            <h2>{level.name}</h2>
            <p>Created by {level.creator.name}</p>
            <button onClick={() => navigate("/game", { state: level })}>
              Play
            </button>
          </div>
        ))}
      </>
    );
  }
}

export default Singleplayer;
