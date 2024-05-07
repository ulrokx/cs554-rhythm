import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
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
    })();
  }, [user, id]);
  if (!profile) {
    return <div>Loading...</div>;
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
