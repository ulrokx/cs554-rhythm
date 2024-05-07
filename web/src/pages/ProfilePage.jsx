import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { css } from "@emotion/react";
import { BeatLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
`;

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();
  const { id } = useParams();
  useEffect(() => {
    if (!id && !user) {
      return navigate("/sign-in");
    }
    if (!id) {
      return navigate(`/profile/${user.id}`);
    }
    (async () => {
      const response = await axios(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
      );
      setProfile(response.data);
      setLoading(false);
    })();
  }, [user, id]);
  if (!profile) {
    return (
      <div className="loading-spinner">
        <BeatLoader color={"#ff9933"} loading={loading} css={override} size={15} />
      </div>
    );
  }
  return (
    <div className="profile-page">
      <h1>{profile.name}</h1>
      <img
        className="profile-picture"
        src={profile.image}
        alt="profile picture"
      />
      <div className="favorite-levels">
        <h2>Favorite Levels</h2>
        {profile.favoriteLevels.map((level) => (
          <div key={level._id} className="favorite-level">
            <h3>{level.name}</h3>
          </div>
        ))}
      </div>
      <div className="following">
        <h2>Following</h2>
        {profile.friends.map((friend) => (
          <div key={friend._id} className="following-item">
            <h3>{friend.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProfilePage;
