import React from "react";
import { Route, Link, Routes } from "react-router-dom";
import axios from "axios";

function Home() {
  return (
    <>
      <div className="home-container">
        <h1 className="home-title">Rhythm Game</h1>
        <p className="home-description">
          Welcome to our rhythm typing game!
          <br />
          Experience the thrill of typing to the beat of the music while
          improving your typing skills.
          <br />
          Our game combines the fun of music with the challenge of precision
          typing.
        </p>

        <div className="button-container"></div>

        <h2 className="overview-title">Overview</h2>
        <p className="overview-description">
          Our project is a web application-based video game focusing on rhythm
          and typing. Players type pre-mapped keyboard keys to the beat of a
          song, aiming for precision to earn points. The game features
          singleplayer and multiplayer modes, along with a level creator for
          user-generated content.
        </p>

        <h2>About the Team</h2>
        <div className="about-team">
          <div className="team-member">
            <p>
              <strong>Daniel Zamloot</strong>
              <br />
              Computer Science Major
              <br />
              Github:
              <a href="https://github.com/danzam284" target="_blank">
                {" "}
                @danzam284
              </a>
              <br />
              Email:
              <a href="mailto:dzamloot@stevens.edu" target="_blank">
                {" "}
                dzamloot@stevens.edu
              </a>
            </p>
          </div>
          <div className="team-member">
            <p>
              <strong>Ricky Kirk</strong>
              <br />
              Computer Science Major
              <br />
              Github:
              <a href="https://github.com/ulrokx" target="_blank">
                {" "}
                @ulrokx
              </a>
              <br />
              Email:
              <a href="mailto:rkirk@stevens.edu" target="_blank">
                {" "}
                rkirk@stevens.edu
              </a>
            </p>
          </div>
          <div className="team-member">
            <p>
              <strong>Joshua Bernstein</strong>
              <br />
              Computer Science Major
              <br />
              Github:
              <a href="https://github.com/joshbernsteint" target="_blank">
                {" "}
                @joshbernsteint
              </a>
              <br />
              Email:
              <a href="mailto:jbernst1@stevens.edu" target="_blank">
                {" "}
                jbernst1@stevens.edu
              </a>
            </p>
          </div>
          <div className="team-member">
            <p>
              <strong>Lauren Kibalo</strong>
              <br />
              Software Engineering Major
              <br />
              Github:
              <a href="https://github.com/Lauren130" target="_blank">
                {" "}
                @Lauren130
              </a>
              <br />
              Email:
              <a href="mailto:lkibalo@stevens.edu" target="_blank">
                {" "}
                lkibalo@stevens.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
