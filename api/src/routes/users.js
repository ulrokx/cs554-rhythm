import { Router } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import {
  getAllUsers,
  addFavoriteLevel,
  getUserByClerkId,
  removeFavoriteLevel,
  addFriend,
  removeFriend,
  addHighestScore,
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

router.get(
  "/friends",
  ClerkExpressWithAuth({ debug: true }),
  async (req, res) => {
    if (!req.auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const user = await getUserByClerkId(req.auth.userId);
      res.json(user.friends);
    } catch {
      return res.status(404).json({ error: "User not found" });
    }
  },
);

router.post("/highscore/:levelId", ClerkExpressWithAuth(), async (req, res) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { levelId } = req.params;
  if (!levelId || typeof levelId !== "string") {
    return res.status(400).json({ error: "Invalid level ID" });
  }
  const { newScore } = req.body;
  if (isNaN(newScore) || newScore < 0) {
    return res.status(400).json({ error: "Invalid Score" });
  }
  try {
    await addHighestScore(req.auth.userId, levelId, newScore);
    res.status(200).json({ success: true });
  } catch (e) {
    if (e.message) {
      return res.status(400).json({ error: e.message });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

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

router.post("/friend/:userId", ClerkExpressWithAuth(), async (req, res) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userId } = req.params;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid User ID" });
  }
  try {
    await addFriend(req.auth.userId, userId);
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

router.delete("/friend/:userId", ClerkExpressWithAuth(), async (req, res) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userId } = req.params;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid User ID" });
  }
  try {
    await removeFriend(req.auth.userId, req.params.userId);
    res.status(200).json({ success: true });
  } catch {
    if (e.message) {
      return res.status(400).json({ error: e.message });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/me", ClerkExpressWithAuth(), async (req, res) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(req.auth.userId);
    res.json(user);
  } catch {
    return res.status(404).json({ error: "User not found" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const user = await getUserByClerkId(req.params.id);
    res.json(user);
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({ error: e.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  res.json(await getAllUsers());
});

export default router;
