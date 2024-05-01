import { ObjectId } from "mongodb";
import { levels, users } from "./config/mongoCollections";
const usersCollection = await users();
const levelsCollection = await levels();

const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const validateName = (name) => {
  name = name.trim();
  if (!name || typeof name !== "string") {
    throw new Error("Name must be a non-empty string");
  }

  if (name.length < 2 || name.length > 20) {
    throw new Error("Name must be between 2 and 20 characters long");
  }
  return name;
};

const validateData = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Data must be an object");
  }
  const keys = Object.keys(data);
  if (keys.length !== letters.keys) {
    throw new Error("Data must have 26 keys");
  }
  keys.forEach((key) => {
    if (!letters.includes(key)) {
      throw new Error("Data must have keys a-z");
    }
    if (!Array.isArray(data[key])) {
      throw new Error("Data values must be arrays");
    }
    data[key].forEach((value) => {
      if (typeof value !== "number") {
        throw new Error("Data values must be numbers");
      }
      if (value < 0) {
        throw new Error("Data values must be non-negative");
      }
      data[key].sort((a, b) => a - b);
    });
  });
  return data;
};

const validateUserId = async (userId) => {
  userId = userId.trim();
  if (!userId || typeof userId !== "string") {
    throw new Error("User ID must be a non-empty string");
  }
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// TODO: file uploading
export const createLevel = async (level) => {
  const name = validateName(level.name);
  const data = validateData(level.data);
  const user = await level.userId;
  const levelDocument = {
    name,
    data,
    creator: {
      _id: user._id,
      name: user.name,
    },
  };
  const insertResult = await levelsCollection.insertOne(levelDocument);
  if (!insertResult.insertedId) {
    throw new Error("Failed to insert level");
  }
  const newLevel = await levelsCollection.findOne({
    _id: insertResult.insertedId,
  });
  return newLevel;
};
