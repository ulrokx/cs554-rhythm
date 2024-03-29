import "../App.css";
function Type(props) {
    const {time, letter, currentTime} = props;
    const screenWidth = window.screen.width;
    const leftPosition = ((time - currentTime) / 10) + (screenWidth / 2) - 25;

    //move 100px per second
    //distance = (time - currentTime) / 10;
    return (
        <>
            <div className="type" style={{left: leftPosition +  "px"}}>
                {letter}
            </div>
        </>
    )
}

export default Type;