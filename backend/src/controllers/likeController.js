import { Like } from "../models/likeModel.js";
import { Notification } from "../models/notificationModel.js";
import { Post } from "../models/postModel.js";

export const toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Проверяем, лайкал ли ранее
    const existingLike = await Like.findOne({ author: userId, post: postId });

    if (existingLike) {
      await existingLike.deleteOne();
    } else {
      await Like.create({ author: userId, post: postId });

      if (post.author.toString() !== userId.toString()) {
        const duplicate = await Notification.findOne({
          type: "like",
          sender: userId,
          receiver: post.author,
          post: post._id,
        });

        if (!duplicate) {
          await Notification.create({
            type: "like",
            sender: userId,
            receiver: post.author,
            post: post._id,
          });
        }
      }
    }

    // Обновляем счётчик лайков
    const updatedLikesCount = await Like.countDocuments({ post: postId });
    await Post.findByIdAndUpdate(postId, { likesCount: updatedLikesCount });

    res.status(200).json({
      message: existingLike ? "Post unliked" : "Post liked",
      liked: !existingLike,
      likesCount: updatedLikesCount,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Получить количество лайков поста
export const getPostLikes = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const count = await Like.countDocuments({ post: postId });

    res.status(200).json({ postId, likes: count });
  } catch (err) {
    console.error("Like count error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Проверить, лайкнул ли текущий пользователь пост
export const isPostLiked = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const liked = await Like.findOne({ author: userId, post: postId });

    res.status(200).json({ liked: !!liked });
  } catch (err) {
    console.error("Check like status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeController = {
  toggleLike,
  getPostLikes,
  isPostLiked,
};
