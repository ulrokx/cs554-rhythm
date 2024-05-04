import { Router } from "express";
import { getLevels } from "../data/levels.js";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await getLevels());
});

export default router;
