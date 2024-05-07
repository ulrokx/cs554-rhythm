import { useLocation } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";

const LeaderboardPage = () => {
  const { state } = useLocation();
  return <Leaderboard scores={state} />;
};
export default LeaderboardPage;
