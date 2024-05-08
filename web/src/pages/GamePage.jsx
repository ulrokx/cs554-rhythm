import Game from "../components/Game";
import { useLocation } from "react-router-dom";

const GamePage = () => {
  const { state } = useLocation();
  return <Game level={state.data} levelName={state.name} levelId={state._id} />;
};
export default GamePage;
