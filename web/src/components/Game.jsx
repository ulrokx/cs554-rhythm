//Basic test song
//Keep all lowercase for checking
const alphabetSong = {
    'a': [4.05], 'b': [4.52], 'c': [4.97], 'd': [5.5], 'e': [6], 'f': [6.6], 'g': [7.03], 'h': [8.07], 'i': [8.57], 'j': [9.07], 'k': [9.45], 'l': [9.93], 'm': [10.22], 'n': [10.45], 'o': [10.77], 'p': [10.93], 'q': [11.98], 'r': [12.54], 's': [13.04], 't': [13.95], 'u': [14.47], 'v': [14.91], 'w': [15.83], 'x': [16.78], 'y': [17.73], 'z': [18.73]
}
//Leeway for correct click
const epsilon = 0.25;

import { useEffect, useState } from "react";
import { useStopwatch } from "react-use-precision-timer";
import Type from "./Type";
import "../App.css";

//Gets all types needed for a song: returns [[time, letter], ...]
function getAllTypingNeeded(song) {
    const letters = Object.keys(song);
    const types = [];
    letters.forEach(letter => {
        for (let i = 0; i < song[letter].length; i++) {
            types.push([song[letter][i], letter]);
        }
    });
    return types;
}


function Game() {

    //Stopwatch object from https://justinmahar.github.io/react-use-precision-timer/?path=/story/docs-usetimer--docs#timer
    const stopwatch = useStopwatch();
    const [score, setScore] = useState(0);
    const [_, setOurTimer] = useState(0); //Use ourTimer to cause render in a small interval
    const [typeObjects, setTypeObjects] = useState(getAllTypingNeeded(alphabetSong));

    useEffect(() => {
        stopwatch.start();
        new Audio("/songs/abc.mp3").play();

        //Causes render every 10 ms
        setInterval(() => {
            setOurTimer(stopwatch.getElapsedRunningTime());
        }, 10);

        //Handles key press
        document.addEventListener('keydown', e => {
            const key = e.key.toLowerCase();
            const currentTime = stopwatch.getElapsedRunningTime() / 1000;

            //Checks if it is a valid click
            if (Object.keys(alphabetSong).includes(key)) {
                const validPressTimes = alphabetSong[key];
                for (let i = 0; i < validPressTimes.length; i++) {
                    const checkPressTime = validPressTimes[i];

                    //Click time is close enough to an intended click
                    if (currentTime >= checkPressTime - epsilon && currentTime <= checkPressTime + epsilon) {
                        setScore(prevScore => prevScore + 1);
                        alphabetSong[key].splice(i, 1); //Get rid of used click
                        setTypeObjects(getAllTypingNeeded(alphabetSong));
                        break;
                    } else if (checkPressTime > currentTime) { //Times are sorted so exit if higher
                        break
                    }
                }
            }
        })
    }, []);

    return (
        <>
            <div>Score: {score}</div>
            <div id="range"></div>
            {typeObjects.map((t) =>
                <Type key={t[0] + t[1]}
                    time={t[0] * 1000}
                    letter={t[1]}
                    currentTime={stopwatch.getElapsedRunningTime()}
                />
            )}
        </>
    )
}

export default Game;