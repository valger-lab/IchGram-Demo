import express from "express";
const router = express.Router();
import { likeController } from "../controllers/likeController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.post("/:id", protect, likeController.toggleLike);

router.get("/:id", likeController.getPostLikes);

router.get("/status/:id", protect, likeController.isPostLiked);

export const likeRoutes = router;
