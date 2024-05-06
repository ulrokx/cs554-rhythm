import React from "react";
import { Route, Link, Routes } from "react-router-dom";
import axios from 'axios';

const alphabetSong = {
  name: "Alphabet",
  data: {
    a: [4.05],
    b: [4.52],
    c: [4.97],
    d: [5.5],
    e: [6],
    f: [6.6],
    g: [7.03],
    h: [8.07],
    i: [8.57],
    j: [9.07],
    k: [9.45],
    l: [9.93],
    m: [10.22],
    n: [10.45],
    o: [10.77],
    p: [10.93],
    q: [11.98],
    r: [12.54],
    s: [13.04],
    t: [13.95],
    u: [14.47],
    v: [14.91],
    w: [15.83],
    x: [16.78],
    y: [17.73],
    z: [18.73]
  }
};


async function seed() {
  await axios.post('http://localhost:4000/seed', {...alphabetSong, userId: "user_2g17W8daeWxOH0PhtDyKSscmDTd"});
}

function Home() {
  return (
    <>
      <div className="home-container">
        <h1 className="home-title">Rhythm Game</h1>
        <p className="home-description">
          Welcome to our rhythm game! This game is designed to be both fun and
          educational, helping users improve their typing skills while enjoying
          the music!
        </p>
        <div className="button-container">
          <Link className="home-game-button" to="/Singleplayer">
            Singleplayer
          </Link>
          <Link className="home-game-button" to="/Multiplayer">
            Multiplayer
          </Link>
          <button onClick={seed}>Seed Database (adds alphabet song w/ fake user)</button>
        </div>
      </div>
    </>
  );
}

export default Home;
