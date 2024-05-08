import React from "react";

function sort(a, b) {
  return b.score - a.score;
}

function Leaderboard(props) {
  const { scores } = props;
  scores.sort(sort);

  if (!scores) {
    return <p>No scores available</p>;
  }

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      {scores.highestScore && <h2>You got a highest score!!</h2>}
      <ol className="score-list">
        {scores.map((score, index) => (
          <li key={index} className="score-item">
            <p>
              <strong>{score.name}</strong> : {score.score}{" "}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
