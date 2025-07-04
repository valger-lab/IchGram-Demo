import express from "express";
const router = express.Router();
import { commentController } from "../controllers/commentController.js";
import { toggleCommentLike } from "../controllers/likeCommentController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.post("/:postId", protect, commentController.addComment);

router.get("/:postId", protect, commentController.getPostComments);

router.delete("/:commentId", protect, commentController.deleteComment);

router.post("/:id/like", protect, toggleCommentLike);
export const commentRoutes = router;
