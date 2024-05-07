import { Router } from "express";
import { getLevels, getLevelById } from "../data/levels.js";

const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  res.json(await getLevelById(id));
});

router.get("/", async (req, res) => {
  res.json(await getLevels());
});

export default router;
