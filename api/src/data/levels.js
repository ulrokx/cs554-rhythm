import { ObjectId } from "mongodb";
import { levels, users } from "./config/mongoCollections.js";
import songHandler from "../../songHandler.js";
import { addUserCreatedSong, getUserByClerkId } from "./users.js";
import { createClient } from "redis";
import fs from "fs";

const usersCollection = await users();
const levelsCollection = await levels();
const allLevelsRedis = "allLevels";
const fileConverter = new songHandler("./songs/");
const client = await createClient().connect();

export const getLevelById = async (id) => {
  if (!ObjectId.isValid(id))
    throw { status: 400, error: "id must be a valid ObjectId" };
  const foundLevel = await levelsCollection.findOne({ _id: new ObjectId(id) });
  if (!foundLevel)
    throw { status: 404, error: "A level with that Id could not be found" };
  return foundLevel;
};

export const getLevelSongData = async (id) => {
  if (!ObjectId.isValid(id))
    throw { status: 400, error: "id must be a valid ObjectId" };
  const redisKey = `song-${id}`;
  if (await client.exists(redisKey)) {
    return JSON.parse(await client.get(redisKey));
  } else {
    const { songPath } = await getLevelById(id);
    const songSize = fs.statSync(songPath).size;
    const retVal = { songPath, songSize };
    await client.set(redisKey, JSON.stringify(retVal), 500);
    return retVal;
  }
};

function checkString(s, label = "string") {
  if (typeof s !== "string") {
    throw { status: 400, error: `${label} must be of type string.` };
  }
  const t = s.trim();
  if (t.length === 0)
    throw { status: 400, error: `${label} must be of length > 0.` };
  return t;
}

function checkBoolean(b, label = "boolean") {
  if (typeof b !== "boolean")
    throw { status: 400, error: `${label} must be of type bool.` };
  return b;
}

function checkLevelData(d) {
  if (!Array.isArray(d))
    throw { status: 400, error: `level data must be an array.` };
  d.forEach((e) => {
    if (!Array.isArray(e) || e.length !== 4)
      throw { status: 400, error: `level data is in an invalid format.` };
    else if (isNaN(e[0]))
      throw { status: 400, error: `level data is in an invalid format.` };
    else if (isNaN(e[1]))
      throw { status: 400, error: `level data is in an invalid format.` };
    else if (typeof e[2] !== "string")
      throw { status: 400, error: `level data is in an invalid format.` };
    else if (isNaN(e[3]))
      throw { status: 400, error: `level data is in an invalid format.` };
  });
  return d;
}

//Uploads and converts the song
export const uploadSong = async (userId, fileObj) => {
  if (!ObjectId.isValid(userId))
    throw { status: 400, error: "id must be a valid ObjectId" };
  const fileData =
    typeof fileObj === "string"
      ? await fileConverter.storeFilePath(userId, fileObj)
      : await fileConverter.storeFile(userId, fileObj);
  const finalName = await fileConverter.convertFile(fileData);
  return finalName;
};

export const getLevelsByCreator = async (clerkId) => {
  let userId;
  try {
    userId = (await getUserByClerkId(clerkId))._id.toString();
  } catch (error) {
    throw { status: 401, error: error.toString() };
  }
  const creatorLevels = (await levelsCollection.find().toArray()).filter(
    (e) => e.creator._id === userId,
  );
  return creatorLevels;
};

export const createLevel = async (body, fileObj) => {
  let userData;
  try {
    userData = await getUserByClerkId(body.userId);
  } catch (error) {
    throw { status: 401, error: error.toString() };
  }

  const userId = userData._id.toString();

  let newLevel;
  if (typeof fileObj === "string") {
    const fileData = await uploadSong(userId, fileObj);
    newLevel = {
      name: body.name,
      data: checkLevelData(body.data),
      creator: {
        _id: userId,
        name: userData.name,
      },
      published: true,
      songPath: fileData.fullPath,
    };
  } else {
    const fileData = await uploadSong(userId, fileObj);
    newLevel = {
      name: body.name,
      data: [],
      creator: {
        _id: userId,
        name: userData.name,
      },
      published: false,
      songPath: fileData.fullPath,
      highscores: [],
    };
  }
  const insertResult = await levelsCollection.insertOne(newLevel);
  if (!insertResult.insertedId) {
    throw { status: 500, error: "Internal Server Error" };
  }

  await addUserCreatedSong(userId, insertResult.insertedId.toString());
  const resultLevel = await levelsCollection.findOne({
    _id: insertResult.insertedId,
  });
  await client.del(allLevelsRedis);
  return resultLevel;
};

export const updateLevel = async (id, data) => {
  if (!ObjectId.isValid(id))
    throw { status: 400, error: "id must be a valid ObjectId" };
  const levelData = await getLevelById(id);
  delete levelData._id;
  //Scan body
  const result = {
    ...levelData,
    name: checkString(data.name, "name"),
    published: checkBoolean(data.published, "published"),
    data: checkLevelData(data.data),
  };
  await client.del(allLevelsRedis);
  const updateResult = await levelsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: result },
    { returnDocument: "after" },
  );
  return updateResult;
};

export const getLevels = async () => {
  if (await client.exists(allLevelsRedis)) {
    return JSON.parse(await client.get(allLevelsRedis));
  } else {
    const levels = (await levelsCollection.find().toArray()).filter(
      (e) => e.published,
    );
    await client.set(allLevelsRedis, JSON.stringify(levels));
    return levels;
  }
};
