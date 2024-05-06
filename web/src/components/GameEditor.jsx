//Leeway for correct click
const epsilon = 0.25;
import { useCallback, useEffect, useRef, useState } from "react";
import "../App.css";


function EditorType({onFeature, onMoveBlock=(()=>{}), onDeleteBlock=(() => {}), featured, ...props}){
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
          onMouseEnter={() => {setFeatured(true);onFeature();}}
          onMouseLeave={() => setFeatured(false)}
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


function GameEditor({running, timestamp, levelData, renderFlag, ...props}) {
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
            const featuredIndex = level.data.findIndex(e => e[0] === featuredId);
            if(key === 'e'){
                setFeaturedIndex(level.data[featuredIndex+1][0]);
            }
            else if(featuredId !== -1){
                switch (key) {
                    case 'q':
                        setFeaturedIndex(level.data[featuredIndex-1][0]);
                        break;
                    case 'a':
                        setLevel((l) => {
                            l.data[featuredIndex][1] -= editorSettings.blockMoveStep;
                            l.data.sort((x,y) => x[1] - y[1]);
                            return {...l};
                        });
                        break;
                    case 'd':
                        setLevel((l) => {
                            l.data[featuredIndex][1] += editorSettings.blockMoveStep;
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
                    default:
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
                                    l.data[i][1] = forward ? l.data[i][1] + editorSettings.blockMoveStep : l.data[i][1] - editorSettings.blockMoveStep;
                                    l.data.sort((x,y) => x[1] - y[1]);
                                    return {...l};
                                });
                            }}
                            onDeleteBlock={() => setLevel(l => {
                                return {data: [...l.data.slice(0,i), ...l.data.slice(i+1)], maxId: l.maxId};
                            })}
                        />
                    )
                }
            </div>
            <div style={{textAlign: "left", width: "auto"}}>
                Step Size: {editorSettings.blockMoveStep}
            </div>
        </div>
      );
}

export default GameEditor;
