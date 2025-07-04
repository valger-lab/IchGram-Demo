import express from "express";
import { register, login } from "../controllers/authController.js";
import {
  forgotPassword,
  changePassword,
} from "../controllers/authController.js";
import demoBlocker from "../middlewares/demoBlocker.js";

const router = express.Router();

router.post("/register", demoBlocker, register);
router.post("/login", login);
router.post("/forgot-password", demoBlocker, forgotPassword);
router.post("/change-password", demoBlocker, changePassword);

export const authRoutes = router;
