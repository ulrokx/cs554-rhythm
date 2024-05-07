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
  if(!ObjectId.isValid(id)) throw {status: 400, error: "id must be a valid ObjectId"};
  const foundLevel = await levelsCollection.findOne({_id: new ObjectId(id)});
  if(!foundLevel) throw {status: 404, error: "A level with that Id could not be found"};
  return foundLevel;
};

export const getLevelSongData = async (id) => {
  if(!ObjectId.isValid(id)) throw {status: 400, error: "id must be a valid ObjectId"};
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


function checkString(s,label="string"){
  if(typeof s !== "string"){
    throw {status: 400, error: `${label} must be of type string.`};
  }
  const t = s.trim();
  if(t.length === 0) throw {status: 400, error: `${label} must be of length > 0.`};
  return t;
}

function checkBoolean(b, label="boolean"){
  if(typeof b !== "boolean") throw {status: 400, error: `${label} must be of type bool.`};
  return b;
}

function checkLevelData(d){
  if(!Array.isArray(d)) throw {status: 400, error: `level data must be an array.`};
  d.forEach(e => {
    if(!Array.isArray(e) || e.length !== 4) throw {status: 400, error: `level data is in an invalid format.`};
    else if(isNaN(e[0])) throw {status: 400, error: `level data is in an invalid format.`};
    else if(isNaN(e[1])) throw {status: 400, error: `level data is in an invalid format.`};
    else if(typeof e[2] !== "string") throw {status: 400, error: `level data is in an invalid format.`};
    else if(isNaN(e[3])) throw {status: 400, error: `level data is in an invalid format.`};
  });
  return d;
}

//Uploads and converts the song
export const uploadSong = async (userId, fileObj) => {
  if(!ObjectId.isValid(userId)) throw {status: 400, error: "id must be a valid ObjectId"};
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
      data: checkLevelData(body.data),
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
      name: body.name,
      data: [],
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

export const updateLevel = async (id, data) => {
    if(!ObjectId.isValid(id)) throw {status: 400, error: "id must be a valid ObjectId"};
    const levelData = await getLevelById(id);
    delete levelData._id;
    //Scan body
    const result = {
      ...levelData,
      name: checkString(data.name, "name"),
      published: checkBoolean(data.published, "published"),
      data: checkLevelData(data.data)
    };

    const updateResult = await levelsCollection.findOneAndUpdate({_id: new ObjectId(id)}, {$set: result}, {returnDocument: "after"});
    return updateResult;
};

export const getLevels = async () => {
  const levels = await levelsCollection.find().toArray();
  return levels;
}