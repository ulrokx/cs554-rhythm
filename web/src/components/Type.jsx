import "../App.css";
function Type(props) {
  const { time, letter, currentTime, up } = props;
  const screenWidth = window.screen.width;
  const leftPosition = (time - currentTime) / 10;

  if (time < currentTime - 1000) return;

  //move 100px per second
  //distance = (time - currentTime) / 10;
  return (
    <>
      <div
        className="type"
        style={{
          left: leftPosition + "px",
          transform: "translateY(" + 51 * up + "px)",
          textAlign: "center",
        }}
      >
        {letter}
      </div>
    </>
  );
}

export default Type;
