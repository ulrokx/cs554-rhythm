import React from "react";

function Leaderboard(props) {
  const { scores } = props;

  if (!scores) {
    return <p>No scores available</p>;
  }

  return (
    <div className="leaderboard-container">
    <h1>Leaderboard</h1>
    <ol className="score-list">
      {scores.map((score, index) => (
        <li key={index} className="score-item">
          <p><strong>{score.name}</strong> : {score.score} </p>
        </li>
      ))}
    </ol>
  </div>
  );
}

export default Leaderboard;

