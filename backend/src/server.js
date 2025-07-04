import express from "express";
import connectDB from "./config/db.js";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "dotenv/config";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { likeRoutes } from "./routes/likeRoutes.js";
import { commentRoutes } from "./routes/commentRoutes.js";
import { searchRoutes } from "./routes/searchRoutes.js";
import { followRoutes } from "./routes/followRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { exploreRoutes } from "./routes/exploreRoutes.js";

const app = express();
const server = http.createServer(app);

const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: frontendURL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: frontendURL,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
const PORT = process.env.PORT || 3003;
connectDB();

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes, followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/explore", exploreRoutes);

// === Socket.IO логика ===
io.on("connection", (socket) => {
  console.log("🔌 Пользователь подключился");

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    io.to(receiverId).emit("receiveMessage", { senderId, text });
  });

  socket.on("disconnect", () => {
    console.log("❌ Пользователь отключился");
  });
});

server.listen(PORT, () => {
  try {
    console.log(`Server is running on PORT http://localhost:${PORT}`);
  } catch (error) {
    res.status(500).json(error);
  }
});
