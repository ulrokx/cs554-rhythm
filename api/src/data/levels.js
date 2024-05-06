import { ObjectId } from "mongodb";
import { levels, users } from "./config/mongoCollections.js";
import songHandler from "../../songHandler.js";
import { getUserByClerk } from "./users.js";
import { createClient } from "redis";
import fs from 'fs';

const usersCollection = await users();
const levelsCollection = await levels();
const fileConverter = new songHandler('./songs/');
const client = await createClient().connect();

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

export const getLevelById = async (id) => {
  const foundLevel = await levelsCollection.findOne({_id: new ObjectId(id)});
  return foundLevel;
};

export const getLevelSongData = async (id) => {
  const redisKey = `song-${id}`;
  if(await client.exists(redisKey)){
    return JSON.parse(await client.get(redisKey));
  }
  else{
    const {songPath} = await getLevelById(id);
    const songSize = fs.statSync(songPath).size;
    const retVal = {songPath, songSize}
    await client.set(redisKey, JSON.stringify(retVal));
    return retVal;
    }
};

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
  if (keys.length != letters.length) {
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

const validateUser = async (user) => {
  user._id = user._id.toString().trim();
  if (!user._id || typeof user._id !== "string") {
    throw new Error("User ID must be a non-empty string");
  }
  const newUser = await usersCollection.findOne({ _id: new ObjectId(user._id) });
  if (!newUser) {
    throw new Error("User not found");
  }
  return newUser;
};

// TODO: file uploading
// export const createLevel = async (level) => {
//   const name = validateName(level.name);
//   const data = validateData(level.data);
//   const user = await validateUser(level.user);
//   const levelDocument = {
//     name,
//     data,
//     creator: {
//       _id: user._id,
//       name: user.name,
//     },
//     published: false,
//   };
//   const insertResult = await levelsCollection.insertOne(levelDocument);
//   if (!insertResult.insertedId) {
//     throw new Error("Failed to insert level");
//   }
//   const newLevel = await levelsCollection.findOne({
//     _id: insertResult.insertedId,
//   });
//   return newLevel;
// };

//Uploads and converts the song
export const uploadSong = async (userId, fileObj) => {
  const fileData = await fileConverter.storeFile(userId, fileObj);
  const finalName = await fileConverter.convertFile(fileData);
  return finalName;
};

export const createLevel = async (body, fileObj) => {
  let userData;
  try {
    userData = await getUserByClerk(body.userId);
  } catch (error) {
    throw {status: 401, error: error.toString()}
  }


  let newLevel;
  if(typeof fileObj === "string"){
    newLevel = {
      name: body.name,
      data: body.data,
      creator: {
        _id: userData._id.toString(),
        name: userData.name,
      },
      published: false,
      songPath: fileObj,
    };
  }
  else{
    const fileData = await uploadSong(userData._id.toString(), fileObj);
    newLevel = {
      name: body.title,
      data: {},
      creator: {
        _id: userData._id.toString(),
        name: userData.name,
      },
      published: false,
      songPath: fileData.fullPath,
    };
  }
  const insertResult = await levelsCollection.insertOne(newLevel);
  if (!insertResult.insertedId) {
    throw {status: 500, error: "Internal Server Error"};
  }
  const resultLevel = await levelsCollection.findOne({
    _id: insertResult.insertedId,
  });
  return resultLevel;
};

export const getLevels = async (level) => {
  const levels = await levelsCollection.find().toArray();
  return levels;
}