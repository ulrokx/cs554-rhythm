import axios from 'axios';
import Requests from '../services/requests';
import { useAuth } from '@clerk/clerk-react';

import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameEditor from '../components/GameEditor';

const alphadata = {
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
};

function transformSongData(songData){
    const allPresses = [];
    let idIndex = 0;
    Object.keys(songData).forEach(k => {
        const instances = songData[k];
        for (const press of instances) {
            allPresses.push([idIndex, press, k]);
            idIndex++;
        }
    });
    allPresses.sort((x,y) => {
        return x[1] - y[1];
    });
    for (let i = 0; i < allPresses.length; i++) {
        allPresses[i].push(i % 3);
    }
    return allPresses;
}

export default function Creator({...props}){

    const requester = new Requests();
    const authData = useAuth();
    const [songData, setSongData] = useState(undefined);
    const [renderFlag, setFlag] = useState(false);
    const [playing, setPlaying] = useState(false);
    const songTime = useRef(0);
    const songUrl = useMemo(() => {
        if(songData) return 'http://localhost:4000/levels/' + "song/" + songData.id;
        else return undefined;
    },[songData]);

    const handleSubmit = useCallback(() => {
        const t = async (event) => {
            const target = event.target;
            event.preventDefault();
            //Make formdata
            const formData = new FormData();
            formData.append('title',target[0].value);
            formData.append('userId',authData.userId);
            formData.append('song',target[1].files[0]);
            const songPost = await axios.post('http://localhost:4000/levels/', formData, {headers: {"Content-Type": 'multipart/form-data'}});
            setSongData({id: songPost.data._id, levelData: songPost.data.data, name: songPost.data.name, songPath: songPost.data.songPath});
        }
        return t;
    },[]);

    useEffect(() => {
        async function getLevel(id){
            const {data} = await axios.get('http://localhost:4000/levels/'+id);
            setSongData({id: data._id, levelData: transformSongData(alphadata), name: data.name, songPath: data.songPath});
        }
        getLevel("6636d02c10e316c2047692ba");
    }, []);


    if(!songData)
        return (
            // TODO: Make this look nice
            <div>
                <form 
                onSubmit={handleSubmit}
                method="POST"
                id='fileUpload'
                >
                    <input type='text' name='Level_Name'/><br/>
                    <input type="file" name='fileUpload' accept='.mp3,.ogg,.wav,.avi,.mp4,.mov,.mkv,.flac,.m4a'/><br/>
                    <input type="submit" />
                </form>
            </div>
        );
    else{
        console.log(songData.levelData);
         return (
            <div style={{padding: "1rem", margin: "1rem"}}>
                <h1>{songData.name}</h1>
                <GameEditor running={playing} renderFlag={renderFlag} levelData={songData.levelData} timestamp={songTime.current}/>
                  <AudioPlayer
                        style={{width: "100%"}}
                        src={songUrl}
                        showSkipControls={false}
                        showJumpControls={false}
                        autoPlayAfterSrcChange={false}
                        listenInterval={1}
                        volume={0.5}
                        onSeeked={() => setFlag(!renderFlag)}
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