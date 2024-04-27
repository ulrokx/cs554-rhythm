import { useLocation } from "react-router-dom";
import Ranking from "../components/Ranking";

const RankingPage = (props) => {
  const { state } = useLocation();
  return <Ranking rankings={state} />;
};
export default RankingPage;
