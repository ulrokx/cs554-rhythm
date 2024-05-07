import { ObjectId } from "mongodb";
import { users, levels } from "./config/mongoCollections.js";
import { getLevelById } from "./levels.js";

const usersCollection = await users();

export const getAllUsers = async (id) => {
  const users = await usersCollection.find().toArray();
  return users;
};

export const getUserById = async (id) => {
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUserByClerkId = async (clerkId) => {
  const user = await usersCollection.findOne({ clerkId });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

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

export const deleteUser = async (user) => {
  const userDocument = await usersCollection.findOne({ clerkId: user.id });
  if (!userDocument) {
    return;
  }
  const deleteResult = await usersCollection.deleteOne({ clerkId: user.id });
  if (deleteResult.deletedCount === 0) {
    throw new Error("Failed to delete user");
  }
  return;
};

export const addFavoriteLevel = async (userId, levelId) => {
  const user = await getUserByClerkId(userId);
  const level = await getLevelById(levelId);
  if (
    user.favoriteLevels.find(({ _id }) => _id.toString() === levelId) !==
    undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $push: { favoriteLevels: { _id: level._id, name: level.name } } },
  );
  if (updateResult.modifiedCount === 0) {
    throw new Error("Failed to add favorite level");
  }
  const newUser = await getUserByClerkId(userId);
  return newUser;
};

export const addHighestScore = async (userId, levelId, newScore) => {
  const user = await getUserByClerkId(userId);
  const level = await getLevelById(levelId);
  const updatedUser = await usersCollection.updateOne({_id: user._id}, {$set: user});
  if (updatedUser.modifiedCount === 0) {
    const addToUser = await usersCollection.updateOne({_id: user._id}, {$push: {highscores: {levelId, score: newScore}}});
    if (addToUser.modifiedCount === 0) {
      throw new Error("Failed to add highest score to user");
    }
  }

  const levelCollection = await levels();
  const addToLevels = await levelCollection.updateOne({_id: level._id}, {$push: {highscores: {name: user.name, score: newScore}}});
  if (addToLevels.modifiedCount === 0) {
    throw new Error("Failed to add highest score to level");
  }
  const newUser = await getUserByClerkId(userId);
  return newUser;
}

export const follow = async (userId, followId) => {
  const user = await getUserByClerkId(userId);
  const follow = await getUserById(followId);
  if (
    user.friends.find(({ _id }) => _id.toString() === followId) !== undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $push: { friends: { _id: follow._id, name: follow.name } } },
  );
  if (updateResult.modifiedCount === 0) {
    throw new Error("Failed to follow user");
  }
  const newUser = await getUserByClerkId(userId);
  return newUser;
};

export const removeFavoriteLevel = async (userId, levelId) => {
  const user = await getUserByClerkId(userId);
  const level = await getLevelById(levelId);
  if (
    user.favoriteLevels.find(({ _id }) => _id.toString() === levelId) ===
    undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $pull: { favoriteLevels: { _id: level._id } } },
  );
  if (updateResult.modifiedCount === 0) {
    throw new Error("Failed to remove favorite level");
  }
  const newUser = await getUserByClerkId(userId);
  return newUser;
};

export const unfollow = async (userId, followId) => {
  const user = await getUserByClerkId(userId);
  const follow = await getUserById(followId);
  if (
    user.friends.find(({ _id }) => _id.toString() === followId) === undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $pull: { friends: { _id: follow._id } } },
  );
  if (updateResult.modifiedCount === 0) {
    throw new Error("Failed to unfollow user");
  }
  const newUser = await getUserByClerkId(userId);
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
