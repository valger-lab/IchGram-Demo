import express from "express";
const router = express.Router();
import { notificationController } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.get("/", protect, notificationController.getNotifications);
router.patch("/:id/read", protect, notificationController.markAsRead);
router.delete(
  "/clearRead",
  protect,
  notificationController.clearReadNotifications
);

export const notificationRoutes = router;
