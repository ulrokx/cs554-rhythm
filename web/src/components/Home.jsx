import React from "react";
import { Route, Link, Routes } from "react-router-dom";

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
          <Link className="home-game-button" to="/Game">
            Launch Game
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
