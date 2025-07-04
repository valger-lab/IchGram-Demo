import express from "express";
const router = express.Router();
import { searchController } from "../controllers/searchController.js";

router.get("/", searchController.searchUsers);

export const searchRoutes = router;
