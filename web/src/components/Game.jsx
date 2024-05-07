//Leeway for correct click
const epsilon = 0.25;

import { useEffect, useState } from "react";
import { Route, Link, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStopwatch } from "react-use-precision-timer";
import Type from "./Type";
import "../App.css";

//Gets all types needed for a song: returns [[time, letter], ...]
function getAllTypingNeeded(song, score) {
  const letters = Object.keys(song);
  const types = [];
  letters.forEach((letter) => {
    for (let i = 0; i < song[letter].length; i++) {
      types.push([song[letter][i], letter]);
    }
  });
  types.sort(function (a, b) {
    a[0] - b[0];
  });
  for (let i = 0; i < types.length; i++) {
    types[i].push((i + score) % 3);
  }
  console.log(types);
  return types;
}

function Game(props) {
  //Stopwatch object from https://justinmahar.github.io/react-use-precision-timer/?path=/story/docs-usetimer--docs#timer
  const stopwatch = useStopwatch();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_, setOurTimer] = useState(0); //Use ourTimer to cause render in a small interval
  const [typeObjects, setTypeObjects] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameScores, setGameScores] = useState([]);

  const { multiplayer, updateScore, level, levelName } = props;

  //Used to start the game immediately if multiplayer
  useEffect(() => {
    if (multiplayer) {
      startGame();
    }
    setTypeObjects(getAllTypingNeeded(level, score));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      stopwatch.start();

      //Manages audio playing and stopping
      const audio = new Audio("/songs/abc.mp3");
      audio.play();
      audio.addEventListener("ended", () => {
        stopwatch.stop();
        setGameScores([{ name: "Player", score }]);
        setIsGameOver(true);
      });

      //Causes render every 10 ms
      setInterval(() => {
        setOurTimer(stopwatch.getElapsedRunningTime());
      }, 10);

      //Handles key press
      document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        const currentTime = stopwatch.getElapsedRunningTime() / 1000;

        //Checks if it is a valid click
        if (Object.keys(level).includes(key)) {
          const validPressTimes = level[key];
          for (let i = 0; i < validPressTimes.length; i++) {
            const checkPressTime = validPressTimes[i];

            //Click time is close enough to an intended click
            if (
              currentTime >= checkPressTime - epsilon &&
              currentTime <= checkPressTime + epsilon
            ) {
              setScore((prevScore) => {
                const newScore = prevScore + 1;
                level[key].splice(i, 1); //Get rid of used click
                if (multiplayer) {
                  updateScore(newScore);
                }
                setTypeObjects(getAllTypingNeeded(level, newScore)); //reupdate the typings
                return newScore;
              });
              break;
            } else if (checkPressTime > currentTime) {
              //Times are sorted so exit if higher
              break;
            }
          }
        }
      });
    }
  }, [isPlaying, isGameOver, gameScores]);

  const restartGame = () => {
    window.location.reload();
  };

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
  };

 
  const endGame = () => {
    navigate("/leaderboard", { state: gameScores });
  };
  

  return (
    <>
      <div className="game-container">
        <h1 className="game-title">
          {multiplayer ? "Multiplayer Mode" : "Alphabet Typing Game"}
        </h1>
        <h2>{levelName}</h2>
        {!multiplayer && (
          <p className="game-instructions">
            {" "}
            <strong> Instructions: </strong> <br /> Type the letters to the beat
            of the song and earn points for each correct keystroke. <br /> Try
            to be as precise as possible to score higher! Get ready to improve
            your typing skills while having fun!
          </p>
        )}

        {!multiplayer && !isPlaying && (
          <button className="start-link" onClick={startGame}>
            Play
          </button>
        )}

        <div className="game-content">
          <div className="score">Score: {score}</div>
          <div id="range"></div>
          {typeObjects.map((t) => (
            <Type
              key={t[0] + t[1]}
              time={t[0] * 1000}
              up={t[2]}
              letter={t[1]}
              currentTime={stopwatch.getElapsedRunningTime()}
            />
          ))}
        </div>
        <div className="game-links">
          {/* <button className="restart-link" onClick={restartGame}>Restart Game</button> */}

          {isGameOver && 
            <button className= "leaderboard-link" onClick={endGame}>
              View Leaderboard
            </button>}

          {!multiplayer && isPlaying && (
            <button className="restart-link" onClick={restartGame}>
              Restart Game
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Game;
