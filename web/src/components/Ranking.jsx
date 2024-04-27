function Ranking(props) {
  const { rankings } = props;
  return (
    <>
      <h2>Congratulations to our winner: {rankings[0].name}!</h2>
      Final Rankings:
      <ol>
        {rankings.map((player) => (
          <li key={player.socketId}>
            {player.name} with a score of {player.score}
          </li>
        ))}
      </ol>
    </>
  );
}

export default Ranking;
