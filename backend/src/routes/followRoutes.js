import express from "express";
const router = express.Router();
import { followController } from "../controllers/followController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.post("/:id/follow", protect, followController.followUser);
router.delete("/:id/unfollow", protect, followController.unfollowUser);
router.get("/:id/followers", followController.getFollowers);
router.get("/:id/following", followController.getFollowing);

export const followRoutes = router;
