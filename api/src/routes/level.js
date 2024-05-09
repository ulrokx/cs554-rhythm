import { Router } from "express";
import {
  createLevel,
  getLevelById,
  getLevelSongData,
  getLevels,
  getLevelsByCreator,
  updateLevel,
} from "../data/levels.js";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import fs from "fs";
const router = Router();

router.get("/", async (req, res) => {
  res.json(await getLevels());
});

router.get("/mylevels", ClerkExpressWithAuth(), async (req, res) => {
  try {
    if (!req.auth.userId) {
      throw { status: 401, error: "Unauthorized" };
    }
    const data = await getLevelsByCreator(req.auth.userId);
    res.status(200).json(data);
  } catch ({ status, error }) {
    res.status(status).json({ error });
  }
});

router.get("/:id", ClerkExpressWithAuth(), async (req, res) => {
  try {
    const levelData = await getLevelById(req.params.id);
    res.status(200).json(levelData);
  } catch ({ error, status }) {
    res.status(status).json({ error });
  }
});

router.post("/", ClerkExpressWithAuth(), async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      throw { status: 400, error: "No files found" };
    //Move file to songs directory and rename it to timestamp
    const newLevel = await createLevel(req.body, req.files.song);
    res.status(200).json(newLevel);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.put("/:id", ClerkExpressWithAuth(), async (req, res) => {
  try {
    const updatedLevel = await updateLevel(req.params.id, req.body);
    res.status(200).json(updatedLevel);
  } catch ({ status, error }) {
    console.log(error);
    res.status(status).json({ error });
  }
});

router.get("/song/:id", async (req, res) => {
  try {
    const range = req.headers.range;
    const { songPath, songSize } = await getLevelSongData(req.params.id);
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + 1000000, songSize - 1); //Replaced CHUNK_SIZE with the number
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${songSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "audio/mp3",
    });
    const audioStream = fs.createReadStream(songPath, { start, end });
    audioStream.pipe(res); //Pipe stream to result
  } catch (error) {
    console.log("failed!", error);
  }
});

export default router;
