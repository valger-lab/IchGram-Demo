import express from "express";
import multer from "multer";
import avatarStorage from "../config/storage/avatars.js";

import demoBlocker from "../middlewares/demoBlocker.js";

const router = express.Router();

const upload = multer({ storage: avatarStorage });

import {
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

router
  .route("/me")
  .get(protect, getCurrentUser)
  .patch(protect, demoBlocker, upload.single("avatar"), updateUserProfile);

router.get("/:id", getUserProfile);

router.get("/", protect, getAllUsers);

export const userRoutes = router;
