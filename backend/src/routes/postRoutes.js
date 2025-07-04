import express from "express";

import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  uploadTempImage,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import demoBlocker from "../middlewares/demoBlocker.js";

const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    getPosts(req, res);
  })
  .post(protect, demoBlocker, createPost);

router

  .route("/:id")
  .get(getPostById)
  .put(protect, demoBlocker, upload.single("image"), updatePost)
  .delete(protect, demoBlocker, deletePost);

router.post(
  "/upload-image-temp",
  demoBlocker,
  protect,
  upload.single("image"),
  uploadTempImage
);

export const postRoutes = router;
