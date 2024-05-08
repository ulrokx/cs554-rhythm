//Leeway for correct click
const epsilon = 0.25;

import { useEffect, useRef, useState } from "react";
import image from "../assets/correct.gif";
import { Route, Link, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStopwatch } from "react-use-precision-timer";
import axios from "axios";
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
  return types;
}

const EPSILON_TIMEOUT = epsilon*2*1000;

function Game(props) {
  //Stopwatch object from https://justinmahar.github.io/react-use-precision-timer/?path=/story/docs-usetimer--docs#timer
  const stopwatch = useStopwatch();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_, setOurTimer] = useState(0); //Use ourTimer to cause render in a small interval
  const [typeObjects, setTypeObjects] = useState(props.level || []);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameScores, setGameScores] = useState([]);
  const [doAnimation, setDoAnimation] = useState(false);

  const { multiplayer, updateScore, level, levelName, levelId } = props;
  const audioRef = useRef();
  const levelRef = useRef({index: 0, data: props.level || [], used: [], timeoutRef: undefined});

  const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

  async function animation(factor) {
    const opts = [-25, ]
    document.getElementById("effect").style.top = (-25 + factor * 50) + "px";
    setDoAnimation(true);
    await sleep(50);
    setDoAnimation(false);
  }

  //Used to start the game immediately if multiplayer
  useEffect(() => {
    if (multiplayer) {
      startGame();
    }
  }, []);

  useEffect(() => {
    if(levelRef.current.timeoutRef){
      clearTimeout(levelRef.current.timeoutRef);
    }
    levelRef.current.timeoutRef = setTimeout(() => {
      levelRef.current.used = [];
      levelRef.current.timeoutRef = undefined;
    }, EPSILON_TIMEOUT);
  },[typeObjects]);

  useEffect(() => {
    if (isPlaying) {
      stopwatch.start();
      //Causes render every 10 ms
      setInterval(() => {
        setOurTimer(stopwatch.getElapsedRunningTime());
      }, 10);

      //Handles key press
      document.addEventListener("keydown", (e) => {
        const currentTime = stopwatch.getElapsedRunningTime() / 1000;
        const key = e.key.toLowerCase();
        const {index, data, used} = levelRef.current;
        for (
          let i = index;
          i < data.length && data[i][1] <= currentTime + epsilon;
          i++
        ) {
          const checkPressTime = data[i][1];
          if (
            currentTime >= checkPressTime - epsilon &&
            currentTime <= checkPressTime + epsilon &&
            key === data[i][2] && !used.includes(data[i][0])
          ) {
            animation(data[i][3]);
            levelRef.current.used.push(data[i][0]);
            setScore((prevScore) => {
              const newScore = prevScore + 1;
              if (multiplayer) {
                updateScore(newScore);
              }
              return newScore;
            });
            setTypeObjects((l) => {
              return l.filter((e) => e[0] !== data[i][0]);
            });
            break;
          }
          levelRef.current.index = i;
        }
      });
    }
  }, [isPlaying, isGameOver, gameScores]);

  const restartGame = () => {
    window.location.reload();
  };

  const startGame = () => {
    setScore(0);
    audioRef.current.volume = 0.5;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const endGame = async () => {
    const userData = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, { withCredentials: true },);
    const highestScores = userData.data.highscores;
    let found = false;
    let highestScore = false;
    for (let i = 0; i < highestScores.length; i++) {
      if (highestScores[i].levelId === levelId) {
        found = true;
        if (score > highestScores[i].score) {
          highestScore = true;
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/users/highscore/${levelId}`,
            {newScore: score},
            { withCredentials: true },
          );
        }
        break;
      }
    }
    if (!found) {
      highestScore = true;
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/highscore/${levelId}`,
        {newScore: score},
        { withCredentials: true },
      );
    }
    const levelData = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/levels/${levelId}`);
    const levelLeaderboard = levelData.data.highscores;
    if (highestScore) {
      levelLeaderboard.highestScore = true;
    }

    navigate("/leaderboard", { state: levelLeaderboard });
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
          <div id="range">
            <img id="effect" hidden={!doAnimation} className="testImage" src={image}></img>
            {typeObjects.map((t, i) => (
              <Type
                key={i}
                time={t[1] * 1000}
                up={t[3]}
                letter={t[2]}
                currentTime={stopwatch.getElapsedRunningTime()}
              />
            ))}
          </div>
        </div>
        <audio
          src={`${import.meta.env.VITE_BACKEND_URL}/levels/song/${props.levelId}`}
          ref={audioRef}
          onEnded={() => {
            console.log("over!");
            stopwatch.stop();
            setGameScores([{ name: "Player", score }]);
            setIsGameOver(true);
            setIsPlaying(false);
          }}
        />
        <div className="game-links">
          {/* <button className="restart-link" onClick={restartGame}>Restart Game</button> */}

          {isGameOver && (
            <button className="leaderboard-link" onClick={endGame}>
              View Leaderboard
            </button>
          )}

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

