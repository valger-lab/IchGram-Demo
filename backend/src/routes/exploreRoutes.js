import express from "express";
import { getRecommendedPosts } from "../controllers/exploreController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecommendedPosts);

export const exploreRoutes = router;
