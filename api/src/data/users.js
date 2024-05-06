import { ObjectId } from "mongodb";
import { users } from "./config/mongoCollections.js";

const usersCollection = await users();

const getUserById = async (id) => {
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUserByClerk = async (id) => {
  const user = await usersCollection.findOne({ clerkId: id });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export const createUser = async (user) => {
  const userDocument = {
    clerkId: user.id,
    email: user.email_addresses[0].email_address,
    name: `${user.first_name} ${user.last_name}`,
    image: user.profile_image_url,
    favoriteLevels: [],
    levels: [],
    games: [],
    friends: [],
    highscores: [],
  };
  const insertResult = await usersCollection.insertOne(userDocument);
  if (!insertResult.insertedId) {
    throw new Error("Failed to create user");
  }
  const newUser = await usersCollection.findOne({
    _id: insertResult.insertedId,
  });
  return newUser;
};

export const recordGame = async (userId, levelId, players) => {
  const user = await getUserById(userId);
  const gameDocument = {
    levelId,
    players,
  };
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $push: { games: gameDocument } },
  );
  if (updateResult.modifiedCount === 0) {
    throw new Error("Failed to record game");
  }
  const newUser = await getUserById(userId);
  return newUser;
};
