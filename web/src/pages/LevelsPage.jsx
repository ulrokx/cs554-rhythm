import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { css } from "@emotion/react";
import { BeatLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
`;

function sortOld(a, b) {
  return a.timestamp - b.timestamp;
}
function sortNew(a, b) {
  return b.timestamp - a.timestamp;
}
function sortFriends(a, b) {
  return b.friendsWithCreator - a.friendsWithCreator;
}
function sortFavorited(a, b) {
  return b.favorited - a.favorited;
}

const sortOptions = {
  oldest: sortOld,
  newest: sortNew,
  friends: sortFriends,
  favorited: sortFavorited,
};

const LevelsPage = () => {
  const [levels, setLevels] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const levelsData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/levels`,
        { withCredentials: true },
      );
      const favoritedData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/favorite`,
        { withCredentials: true },
      );
      const friendsData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/friends`,
        { withCredentials: true },
      );
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        { withCredentials: true },
      );
      const myData = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
        { withCredentials: true },
      );
      setLevels(
        levelsData.data.map((level) => {
          debugger;
          if (favoritedData.data.find(({ _id }) => _id === level._id)) {
            level.favorited = true;
          } else {
            level.favorited = false;
          }
          if (friendsData.data.find(({ _id }) => _id === level.creator._id)) {
            level.friendsWithCreator = true;
          } else {
            level.friendsWithCreator = false;
          }
          let found = false;
          for (let i = 0; i < data.length; i++) {
            if (data[i]._id === level.creator._id) {
              found = true;
              break;
            }
          }
          if (!found || myData.data._id === level.creator._id) {
            level.noShowFriend = true;
          } else {
            level.noShowFriend = false;
          }
          return level;
        }),
      );
      setLoading(false);
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
  const addFriend = async (id) => {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/users/friend/${id}`,
      {},
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        friendsWithCreator:
          level.creator._id === id ? true : level.friendsWithCreator,
      })),
    );
  };

  async function sortLevels(by) {
    const sortFunction = sortOptions[by];
    setLevels((levels) => {
      const sortedLevels = [...levels].sort(sortFunction);
      return sortedLevels;
    });
  }

  const removeFriend = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/users/friend/${id}`,
      { withCredentials: true },
    );
    setLevels((levels) =>
      levels.map((level) => ({
        ...level,
        friendsWithCreator:
          level.creator._id === id ? false : level.friendsWithCreator,
      })),
    );
  };
  if (!levels) {
    return (
      <div className="loading-spinner">
        <BeatLoader
          color={"#ff9933"}
          loading={loading}
          css={override}
          size={15}
        />
      </div>
    );
  }
  return (
    <div className="levels-page">
      <h1 className="levels-header">Levels</h1>
      <h2>Order Levels By</h2>
      <select
        className="sort-dropdown"
        onChange={(event) => sortLevels(event.target.value)}
      >
        <option value="oldest">Oldest</option>
        <option value="newest">Newest</option>
        <option value="friends">Friends</option>
        <option value="favorited">Favorited</option>
      </select>
      <div className="levels-list">
        {levels.map((level) => (
          <div key={level._id} className="level-card">
            <h2 className="level-name">{level.name}</h2>
            <div className="creator-info">
              <p>
                Created by{" "}
                <span className="creator-name">{level.creator.name}</span>
              </p>
              <div className="button-container">
                {!level.noShowFriend &&
                  (level.friendsWithCreator ? (
                    <button
                      className="button unfollow-button"
                      onClick={() => removeFriend(level.creator._id)}
                    >
                      Unfriend
                    </button>
                  ) : (
                    <button
                      className="button follow-button"
                      onClick={() => addFriend(level.creator._id)}
                    >
                      Add Friend
                    </button>
                  ))}
                {level.favorited ? (
                  <button
                    className="button unfavorite-button"
                    onClick={() => removeFavorite(level._id)}
                  >
                    Unfavorite
                  </button>
                ) : (
                  <button
                    className="button favorite-button"
                    onClick={() => addFavorite(level._id)}
                  >
                    Favorite
                  </button>
                )}
                <button
                  className="button play-button"
                  onClick={() => navigate("/game", { state: level })}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default LevelsPage;
