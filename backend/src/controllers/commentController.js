import { Comment } from "../models/commentModel.js";
import { Post } from "../models/postModel.js";
import { Notification } from "../models/notificationModel.js";
import { CommentLike } from "../models/commentLikeModel.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("author");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      text,
      author: req.user.id,
      post: postId,
    });

    // Уведомление автору поста, если не сам себе комментирует
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        type: "comment",
        sender: req.user._id,
        receiver: post.author._id,
        post: post._id,
        comment: comment._id,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Ошибка при добавлении комментария:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Получить комментарии поста
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    const comments = await Comment.find({ post: postId })
      .populate("author", "-password")
      .sort({ createdAt: -1 });

    const commentIds = comments.map((c) => c._id);

    let likedComments = [];
    if (userId) {
      likedComments = await CommentLike.find({
        author: userId,
        comment: { $in: commentIds },
      }).select("comment");
    }

    const likedIds = new Set(likedComments.map((c) => c.comment.toString()));

    const commentsWithLikes = comments.map((c) => ({
      ...c.toObject(),
      liked: likedIds.has(c._id.toString()),
    }));

    res.json(commentsWithLikes);
  } catch (err) {
    console.error("Ошибка при получении комментариев:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Удалить комментарий
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can delete only your comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const commentController = {
  addComment,
  getPostComments,
  deleteComment,
};
