import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function sortOld(a, b) {
  return a.timestamp - b.timestamp;
}
function sortNew(a, b) {
  return b.timestamp - a.timestamp;
}
function sortFollowing(a, b) {
  return b.followingCreator - a.followingCreator;
}
function sortFavorited(a, b) {
  return b.favorited - a.favorited;
}
async function sortPopular(a, b) {
  const {data} = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/users`,
  );
  let cntA = 0, cntB = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].favoriteLevels.length; j++) {
      if (data[i].favoriteLevels[j]._id === a._id) {
        cntA++;
      }
      if (data[i].favoriteLevels[j]._id === b._id) {
        cntB++;
      }
    }
  }
  return cntB - cntA;
}

const sortOptions = {
  "oldest": sortOld,
  "newest": sortNew,
  "following": sortFollowing,
  "favorited": sortFavorited
};

const LevelsPage = () => {
  const [levels, setLevels] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const levelsData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/levels`,
      );
      const favoritedData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/favorite`,
        { withCredentials: true },
      );
      const followingData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/following`,
        { withCredentials: true },
      );
      setLevels(
        levelsData.data.map((level) => {
          if (favoritedData.data.find(({ _id }) => _id === level._id)) {
            level.favorited = true;
          } else {
            level.favorited = false;
          }
          if (followingData.data.find(({_id}) => _id === level.creator._id)) {
            level.followingCreator = true;
          } else {
            level.followingCreator = false;
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
  const follow = async (id) => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/users/follow/${id}`,
      {},
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        followingCreator: level.creator._id === id ? true : level.followingCreator,
      })),
    );
  }

  async function sortLevels(by) {
    const sortFunction = sortOptions[by];
    setLevels((levels) => {
      const sortedLevels = [...levels].sort(sortFunction);
      return sortedLevels;
    });
  }


  const unfollow = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/users/follow/${id}`,
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        followingCreator: level.creator._id === id ? false : level.followingCreator,
      })),
    );
  };
  if (!levels) {
	return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Levels</h1>
      <h2>Order Levels By</h2>
      <select onChange={() => sortLevels(event.target.value)}>
        <option value="oldest">Oldest</option>
        <option value="newest">Newest</option>
        <option value="following">Following</option>
        <option value="favorited">Favorited</option>
      </select>
      {levels.map((level) => (
        <div key={level._id}>
          <h2>{level.name}</h2>
          <div>
            <p>Created by {level.creator.name}</p>
            {level.followingCreator ? (
              <button onClick={() => unfollow(level.creator._id)}>
                Unfollow
              </button>
            ) : (
              <button onClick={() => follow(level.creator._id)}>Follow</button>
            )}
          </div>
          {level.favorited ? (
            <button onClick={() => removeFavorite(level._id)}>
              Unfavorite
            </button>
          ) : (
            <button onClick={() => addFavorite(level._id)}>Favorite</button>
          )}
          <button onClick={() => navigate("/game", { state: level })}>
              Play
            </button>
        </div>
      ))}
    </div>
  );
};
export default LevelsPage;
