import axios from "axios";
import { useEffect, useState } from "react";

const LevelsPage = () => {
  const [levels, setLevels] = useState(null);
  useEffect(() => {
    (async () => {
		debugger
      const levelsData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/levels`,
      );
      const favoritedData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/favorite`,
        { withCredentials: true },
      );
      setLevels(
        levelsData.data.map((level) => {
          if (favoritedData.data.find(({ _id }) => _id === level._id)) {
            level.favorited = true;
          }
          return level;
        }),
      );
    })();
  }, []);
  const addFavorite = async (id) => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/users/favorite/${id}`,
      {},
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        favorited: level._id === id ? true : level.favorited,
      })),
    );
  };
  const removeFavorite = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/users/favorite/${id}`,
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        favorited: level._id === id ? false : level.favorited,
      })),
    );
  };
  if (!levels) {
	return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Levels</h1>
      {levels.map((level) => (
        <div key={level._id}>
          <h2>{level.name}</h2>
          {level.favorited ? (
            <button onClick={() => removeFavorite(level._id)}>
              Unfavorite
            </button>
          ) : (
            <button onClick={() => addFavorite(level._id)}>Favorite</button>
          )}
        </div>
      ))}
    </div>
  );
};
export default LevelsPage;
