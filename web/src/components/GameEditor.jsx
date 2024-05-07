//Leeway for correct click
const epsilon = 0.25;
import { useCallback, useEffect, useRef, useState } from "react";
import "../App.css";
import { round } from "../services/helpers";




function EditorType({onClick, onMoveBlock=(()=>{}), onDeleteBlock=(() => {}), featured, ...props}){
    const [isFeatured, setFeatured] = useState(featured || false);
    const { time, letter, currentTime, up } = props;
    const leftPosition = (time - currentTime) / 10;
  
    if (time < currentTime - 1000) return;
  
    //move 100px per second
    //distance = (time - currentTime) / 10;
    return (
        <div
          className="type"
          style={{
            left: leftPosition + "px",
            transform: "translateY(" + 51 * up + "px)",
            textAlign: "center",
            border: isFeatured || featured ? "2px solid orange" : ""
          }}
          onMouseEnter={() => {setFeatured(true)}}
          onMouseLeave={() => setFeatured(false)}
          onClick={() => featured && onClick()}
        >
          <span>{letter}</span>
          <div style={{textAlign: "center"}}>
            <button className="editor-type-button" onClick={() => onMoveBlock(false)}>{"<"}</button>{' '}
            <button className="editor-type-button" style={{color: "red"}} onClick={onDeleteBlock}>{"x"}</button>{' '}
            <button className="editor-type-button" onClick={() => onMoveBlock(true)}>{">"}</button>
          </div>
        </div>
    );
}

let renderInterval;
let lastTime;


function GameEditor({playerRef, running, timestamp, levelData, renderFlag, onSave, onPublish, ...props}) {
    const [_, runRerender] = useState(undefined);
    const [level, setLevel] = useState({data: levelData, maxId: levelData.length - 1});
    const timeElapsed = useRef(timestamp*1000);
    const [featuredId, setFeaturedIndex] = useState(-1);
    const [editorSettings, setSettings] = useState({
        blockMoveStep: 0.1,
        placeMode: false
    });



    
    useEffect(() => {
        if(running){
            lastTime = Date.now();
            timeElapsed.current = timestamp*1000;
            renderInterval = setInterval(() => {
                const n = Date.now();
                timeElapsed.current += n - lastTime;
                lastTime = n;
                runRerender(n);
            }, 10);
            
        }
        else{
            clearInterval(renderInterval);
        }
    }, [running]);

    useEffect(() => {
        const n = Date.now();
        timeElapsed.current = timestamp*1000;
        lastTime = n;
        runRerender(n);
    }, [renderFlag]);

    
    
    return (
        <div
        tabIndex={0}
        onKeyDown={({key}) => {
            if(editorSettings.placeMode){
                switch (key) {
                    case 'Escape':
                        setSettings({...editorSettings, placeMode: false});
                        break;
                    default:
                        setFeaturedIndex(level.maxId+1);
                        setLevel((l) => {
                            l.data.push([l.maxId+1, timeElapsed.current / 1000, key, 1]);
                            l.data.sort((x,y) => x[1] - y[1]);
                            return {...l, maxId: l.maxId + 1};
                        });
                        break;
                }
            }
            else{
                const featuredIndex = level.data.findIndex(e => e[0] === featuredId);
                switch (key) {
                    case 'e':
                        setFeaturedIndex(level.data[featuredIndex+1][0]);
                        break;
                    case 'p':
                        setSettings({...editorSettings, placeMode: true});
                        break;
                    case ' ':
                        if(running)
                            playerRef.current.audio.current.pause();
                        else
                            playerRef.current.audio.current.play();
                        break;
                    default:
                        if(featuredId !== -1){
                            switch (key) {
                                case 'q':
                                    setFeaturedIndex(level.data[featuredIndex-1][0]);
                                    break;
                                case 'r':
                                    setLevel((l) => {
                                        return {...l, data: l.data.filter(e => e[0] !== featuredId)};
                                    });
                                    if(featuredIndex >= level.data.length - 1){
                                        setFeaturedIndex(-1);
                                    }
                                    else{
                                        setFeaturedIndex(level.data[featuredIndex+1][0]);
                                    }
                                    break;
                                case 'a':
                                    setLevel((l) => {
                                        l.data[featuredIndex][1] = round(l.data[featuredIndex][1] - editorSettings.blockMoveStep, 2);
                                        l.data.sort((x,y) => x[1] - y[1]);
                                        return {...l};
                                    });
                                    break;
                                case 'd':
                                    setLevel((l) => {
                                        l.data[featuredIndex][1] = round(l.data[featuredIndex][1] + editorSettings.blockMoveStep, 2);
                                        l.data.sort((x,y) => x[1] - y[1]);
                                        return {...l};
                                    });
                                    break;
                                case 'w':
                                    setLevel((l) => {
                                        if(l.data[featuredIndex][3] > 0) l.data[featuredIndex][3]--;
                                        return {...l};
                                    });
                                    break;
                                case 's':
                                    setLevel((l) => {
                                        if(l.data[featuredIndex][3] < 2) l.data[featuredIndex][3]++;
                                        return {...l};
                                    });
                                    break;
                                case 'z': 
                                    console.log(editorSettings.blockMoveStep);
                                    if(editorSettings.blockMoveStep > 0.1)
                                        setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep - 0.1, 2)});
                                    else if(editorSettings.blockMoveStep > 0)
                                        setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep - 0.01, 2)});
                                    break;
                                case 'c': 
                                    if(editorSettings.blockMoveStep < 0.1)
                                        setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep + 0.01, 2)});
                                    else if(editorSettings.blockMoveStep < 1)
                                        setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep + 0.1, 2)});
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                }
            }
        }}
        className="full_page"
        >
            <div id="range" >
                {
                    level.data.map((t,i) => 
                        <EditorType
                            key={i}
                            time={t[1] * 1000}
                            up={t[3]}
                            letter={t[2]}
                            featured={featuredId === t[0]}
                            currentTime={timeElapsed.current}
                            onMoveBlock={(forward) => {
                                setLevel((l) => {
                                    l.data[i][1] = forward ? round(l.data[i][1] + editorSettings.blockMoveStep,2) : round(l.data[i][1] - editorSettings.blockMoveStep,2);
                                    l.data.sort((x,y) => x[1] - y[1]);
                                    return {...l};
                                });
                            }}
                            onDeleteBlock={() => {setLevel(l => {
                                return {data: [...l.data.slice(0,i), ...l.data.slice(i+1)], maxId: l.maxId};
                            });setFeaturedIndex(-1);}  }
                            onClick={() => {
                                console.log('click!');
                                setFeaturedIndex(t[0]);
                            }}
                        />
                    )
                }
            </div>
            <div style={{textAlign: "center", width: "200px", border: "1px solid gray", padding: "0 1.5rem", borderRadius: "5px"}}>
                <h2 >Legend</h2>
                <div style={{textAlign: "left"}}>
                    <p hidden={editorSettings.placeMode}><span style={{fontStyle: "italic"}}>Step Size: </span>
                        {editorSettings.blockMoveStep} {' '}
                        <span style={{border: "1px solid black", borderRadius: "5px", padding: ".1rem"}}>
                            <button className="editor-type-button" style={{fontSize: "20pt"}} onClick={() => {
                                if(editorSettings.blockMoveStep > 0.1) setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep - 0.1, 2)});
                                else if(editorSettings.blockMoveStep > 0)
                                    setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep - 0.01, 2)});
                            }}>-</button>{' '}
                            <button className="editor-type-button" style={{fontSize: "20pt"}} onClick={() => {
                                if(editorSettings.blockMoveStep < 0.1){
                                    setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep + 0.01, 2)});
                                }
                                else if(editorSettings.blockMoveStep < 1)
                                    setSettings({...editorSettings, blockMoveStep: round(editorSettings.blockMoveStep + 0.1, 2)});
                            }}>+</button>
                        </span>
                    </p>
                    <p><span style={{fontStyle: "italic"}}>Editor Mode: </span>{editorSettings.placeMode ? "Place" : "Mover"}</p>
                    <h3 style={{padding: "0", margin: "0"}}>Controls</h3>
                    {
                    editorSettings.placeMode ? (
                        <ul style={{marginTop: "0"}}>
                            <li><span style={{fontStyle: "italic"}}>Escape: </span> Mover Mode</li>
                            <li><span style={{fontStyle: "italic"}}>[Any Key]: </span> Place Block</li>
                        </ul>
                    ) : (
                        <ul style={{marginTop: "0"}}>
                            <li><span style={{fontStyle: "italic"}}>p: </span> Place Mode</li>
                            <li><span style={{fontStyle: "italic"}}>x: </span> Delete Block</li>
                            <li><span style={{fontStyle: "italic"}}>q/e: </span> Select left/right</li>
                            <li><span style={{fontStyle: "italic"}}>a/d: </span> Move left/right</li>
                            <li><span style={{fontStyle: "italic"}}>w/s: </span> Move up/down</li>
                            <li><span style={{fontStyle: "italic"}}>z/c: </span> Step size up/down</li>
                        </ul>
                    )
                    }
                </div>

            </div>
            <div>
                <button style={{width: "125px"}} onClick={() => onPublish(level.data)}>{props.isPublished ? "Unpublish" : "Publish"}</button>
                <button style={{width: "125px"}} onClick={() => onSave(level.data)}>Save</button>
            </div>
        </div>
      );
}

export default GameEditor;
