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
    throw { status: 404, error: "User not found" };
  }
  return user;
};

export const addUserCreatedSong = async (userId, levelId) => {
  const updateResult = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $push: {
        levels: levelId,
      },
    },
    { returnDocument: "after" },
  );
  if (!updateResult) {
    throw { status: 500, error: "Internal Server Error" };
  }
  return updateResult;
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
  await Promise.all(
    userDocument.friends.map(async (friend) => {
      const friendDocument = await usersCollection.findOne({ _id: friend._id });
      if (!friendDocument) {
        return;
      }
      await usersCollection.updateOne(
        { _id: friend._id, "friends._id": userDocument._id },
        {
          $set: {
            "friends.$.deleted": true,
          },
        },
      );
    }),
  );
  const deleteResult = await usersCollection.deleteOne({ clerkId: user.id });
  if (deleteResult.deletedCount === 0) {
    throw new Error("Failed to delete user");
  }
  return;
};

export const addHighestScore = async (userId, levelId, newScore) => {
  const user = await getUserByClerkId(userId);
  const level = await getLevelById(levelId);
  const updatedUser = await usersCollection.updateOne(
    { _id: user._id },
    { $set: user },
  );
  if (updatedUser.modifiedCount === 0) {
    const addToUser = await usersCollection.updateOne(
      { _id: user._id },
      { $push: { highscores: { levelId, score: newScore } } },
    );
    if (addToUser.modifiedCount === 0) {
      throw new Error("Failed to add highest score to user");
    }
  }

  const levelCollection = await levels();
  const addToLevels = await levelCollection.updateOne(
    { _id: level._id },
    { $push: { highscores: { name: user.name, score: newScore } } },
  );
  if (addToLevels.modifiedCount === 0) {
    throw new Error("Failed to add highest score to level");
  }
  const newUser = await getUserByClerkId(userId);
  return newUser;
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

export const addFriend = async (userId, friendId) => {
  const user = await getUserByClerkId(userId);
  const friend = await getUserById(friendId);
  if (
    user.friends.find(({ _id }) => _id.toString() === friendId) !== undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    {
      $push: {
        friends: {
          _id: friend._id,
          name: friend.name,
          clerkId: friend.clerkId,
        },
      },
    },
  );
  const friendUpdateResult = await usersCollection.updateOne(
    { _id: friend._id },
    {
      $push: {
        friends: { _id: user._id, name: user.name, clerkId: user.clerkId },
      },
    },
  );
  if (
    updateResult.modifiedCount === 0 ||
    friendUpdateResult.modifiedCount === 0
  ) {
    throw new Error("Failed to friend user");
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

export const removeFriend = async (userId, friendId) => {
  const user = await getUserByClerkId(userId);
  const friend = await getUserById(friendId);
  if (
    user.friends.find(({ _id }) => _id.toString() === friendId) === undefined
  ) {
    return;
  }
  const updateResult = await usersCollection.updateOne(
    { _id: user._id },
    { $pull: { friends: { _id: friend._id } } },
  );
  const friendUpdateResult = await usersCollection.updateOne(
    { _id: friend._id },
    { $pull: { friends: { _id: user._id } } },
  );
  if (
    updateResult.modifiedCount === 0 ||
    friendUpdateResult.modifiedCount === 0
  ) {
    throw new Error("Failed to friend user");
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
