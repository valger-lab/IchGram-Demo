import { Comment } from "../models/commentModel.js";
import { CommentLike } from "../models/commentLikeModel.js";
import { Post } from "../models/postModel.js";
import { Notification } from "../models/notificationModel.js";

export const toggleCommentLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("author");
    if (!comment) {
      return res.status(404).json({ message: "Комментарий не найден" });
    }

    const existingLike = await CommentLike.findOne({
      author: userId,
      comment: commentId,
    });

    if (existingLike) {
      await existingLike.deleteOne();
    } else {
      await CommentLike.create({ author: userId, comment: commentId });

      if (
        comment.author &&
        comment.author._id.toString() !== userId.toString()
      ) {
        const post = await Post.findById(comment.post);

        await Notification.create({
          sender: userId,
          receiver: comment.author._id,
          type: "likeComment",
          post: post?._id || null,
          comment: comment._id,
          isRead: false,
        });
      }
    }

    // Обновить счётчик лайков комментария
    const likesCount = await CommentLike.countDocuments({ comment: commentId });
    comment.likesCount = likesCount;
    await comment.save();

    res.status(200).json({
      liked: !existingLike,
      likesCount,
    });
  } catch (err) {
    console.error("Ошибка при переключении лайка комментария:", err);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};

export const getCommentLikesStatus = async (req, res) => {
  const userId = req.user._id;
  const commentIds = req.body.commentIds;

  const likedComments = await CommentLike.find({
    author: userId,
    comment: { $in: commentIds },
  }).select("comment");

  res.json({
    likedCommentIds: likedComments.map((c) => c.comment.toString()),
  });
};
