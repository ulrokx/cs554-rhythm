import { Router } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import {
  addFavoriteLevel,
  getUserByClerkId,
  removeFavoriteLevel,
} from "../data/users.js";

const router = Router();

router.get(
  "/favorite",
  ClerkExpressWithAuth({ debug: true }),
  async (req, res) => {
    if (!req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const user = await getUserByClerkId(req.auth.userId);
      res.json(user.favoriteLevels);
    } catch {
      return res.status(404).json({ error: "User not found" });
    }
  },
);

router.post("/favorite/:levelId", ClerkExpressWithAuth(), async (req, res) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { levelId } = req.params;
  if (!levelId || typeof levelId !== "string") {
    return res.status(400).json({ error: "Invalid level ID" });
  }
  try {
    await addFavoriteLevel(req.auth.userId, levelId);
    res.status(200).json({ success: true });
  } catch (e) {
    if (e.message) {
      return res.status(400).json({ error: e.message });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.delete(
  "/favorite/:levelId",
  ClerkExpressWithAuth(),
  async (req, res) => {
    if (!req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { levelId } = req.params;
    if (!levelId || typeof levelId !== "string") {
      return res.status(400).json({ error: "Invalid level ID" });
    }
    try {
      await removeFavoriteLevel(req.auth.userId, req.params.levelId);
      res.status(200).json({ success: true });
    } catch {
      if (e.message) {
        return res.status(400).json({ error: e.message });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  },
);

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  res.json(await getUserByClerkId(req.params.id));
});

export default router;
