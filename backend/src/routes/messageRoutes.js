import express from "express";
const router = express.Router();
import { messageController } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

router.post("/", protect, messageController.sendMessage);
router.get("/:userId", protect, messageController.getChat);
router.get("/contacts/list", protect, messageController.getContacts);
router.get("/unread/counts", protect, messageController.getUnreadCounts);
router.delete("/:userId", protect, messageController.deleteMessages);

export const messageRoutes = router;
