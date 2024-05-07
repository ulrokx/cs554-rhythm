import axios from 'axios';
import Requests from '../services/requests';
import { useAuth } from '@clerk/clerk-react';

import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameEditor from '../components/GameEditor';
import { round } from '../services/helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";


export default function Creator({...props}){
    const params = useParams();
    const authData = useAuth();
    const navigatge = useNavigate();
    const [songData, setSongData] = useState(undefined);
    const [baseData, setBaseData] = useState(undefined);
    const [renderFlag, setFlag] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const songTime = useRef(0);
    const playerRef = useRef();
    const songUrl = useMemo(() => {
        if(songData) return 'http://localhost:4000/levels/' + "song/" + songData.id;
        else return undefined;
    },[songData]);


    async function handleSubmit(event){
        const target = event.target;
        event.preventDefault();
        //Make formdata
        const formData = new FormData();
        formData.append('name',target[0].value);
        formData.append('userId',authData.userId);
        formData.append('song',target[1].files[0]);
        const songPost = await axios.post('http://localhost:4000/levels/', formData, {headers: {"Content-Type": 'multipart/form-data'}});
        navigatge(`/creator/${songPost.data._id}`);
    }

    function setSongDataFromInput(data){
        const r = {id: data._id, levelData: data.data, name: data.name, songPath: data.songPath, published: data.published};
        setBaseData({...r})
        setSongData({...r});
    }

    async function handleSave(data, newPublished){
        //Make sure all data times are rounded
        const roundedTimes = data.map(e => [e[0], round(e[1],2), e[2].toLowerCase(), e[3]]);
        const res = await axios.put('http://localhost:4000/levels/'+songData.id, {
            data: roundedTimes,
            name: songData.name,
            published: newPublished,
        });
        setSongDataFromInput(res.data);
    }

    useEffect(() => {
        async function getLevel(id){
            const {data} = await axios.get('http://localhost:4000/levels/'+id);
            // setSongData({id: data._id, levelData: data.data, name: data.name, songPath: data.songPath, published: data.published});
            setSongDataFromInput(data);
        }
        if(params.id) getLevel(params.id);
    }, [params.id]);




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
         return (
            <div style={{padding: "1rem", margin: "1rem"}}>
                {
                    editingTitle ? (
                        <div style={{textAlign: "center"}}>
                            <form onSubmit={(e) => {
                                const target = e.target[0];
                                e.preventDefault();
                                setSongData({...songData, name: target.value.trim()});
                                setEditingTitle(false);
                            }}>
                            <input defaultValue={songData.name} type="text" style={{
                            background: "transparent", border: "1px solid #213547", 
                            textAlign: "center", borderRadius: "5px", color: "#ff9933", fontSize: "3.2em", lineHeight: "1.1", fontWeight: "bold",
                            margin: "2rem 0"
                        }}/>
                            </form>
                        </div>
                    ) : (
                        <h1 style={{textAlign: "center", margin: "2rem 0"}}>{songData.name} <span hidden={editingTitle}><FaEdit style={{color: "black", cursor: "pointer"}} onClick={() => setEditingTitle(true)}/></span></h1>
                    )
                }
                <GameEditor 
                running={playing} 
                renderFlag={renderFlag} 
                levelData={songData.levelData} 
                timestamp={songTime.current}
                isPublished={songData.published}
                onSave={(d) => handleSave(d, songData.published)}
                onPublish={(d) => handleSave(d, !songData.published)}
                playerRef={playerRef}
                />
                <br/>
                  <AudioPlayer
                        style={{width: "100%"}}
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