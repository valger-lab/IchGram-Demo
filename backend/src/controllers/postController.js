import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { Like } from "../models/likeModel.js";
import { Notification } from "../models/notificationModel.js";
import { CommentLike } from "../models/commentLikeModel.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  const { description, videoUrl, image, imagePublicId } = req.body;

  try {
    const post = await Post.create({
      author: req.user._id,
      description,
      image: image || null,
      imagePublicId: imagePublicId || null,
      videoUrl: videoUrl || null,
    });

    // Повторно получаем пост с populate
    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "username fullName avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Ошибка при создании поста:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const random = req.query.random === "true"; // Нужно сразу определить, true или false.

    const filter = {};
    if (req.query.author) {
      if (mongoose.Types.ObjectId.isValid(req.query.author)) {
        filter.author = req.query.author;
      } else {
        return res.status(400).json({ message: "Invalid author ID" });
      }
    }
    if (req.query.q)
      filter.description = { $regex: req.query.q, $options: "i" };

    let posts = [];
    let total = await Post.countDocuments(filter); // считаем общее кол-во

    if (random) {
      // Случайная выборка с агрегацией
      posts = await Post.aggregate([
        { $match: filter },
        { $sample: { size: limit } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            "author.password": 0,
            "author.email": 0,
          },
        },
      ]);
    } else {
      // Обычная пагинация и сортировка
      posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullName avatar");
      total = await Post.countDocuments(filter);
    }

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      posts,
    });
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username fullName avatar"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { image, imagePublicId, description } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (typeof image === "string") post.image = image;
    if (typeof imagePublicId === "string") post.imagePublicId = imagePublicId;
    if (typeof description === "string") post.description = description;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Ошибка при обновлении поста:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Удаление изображения из Cloudinary (если есть imagePublicId)
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
        console.log("Удалено из Cloudinary:", post.imagePublicId);
      } catch (err) {
        console.error("Ошибка при удалении с Cloudinary:", err.message);
      }
    }

    await post.deleteOne();

    // Удаляем связанные комментарии
    const comments = await Comment.find({ postId: post._id });
    const commentIds = comments.map((c) => c._id);

    // Удаляем связанные данные
    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      Notification.deleteMany({ post: post._id }),
      CommentLike.deleteMany({ comment: { $in: commentIds } }),
    ]);

    res.status(200).json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadTempImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    return res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Ошибка при временной загрузке изображения:", error.message);
    res.status(500).json({ message: "Upload failed" });
  }
};
