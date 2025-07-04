import { Post } from "../models/postModel.js";
import { Like } from "../models/likeModel.js";
import { Comment } from "../models/commentModel.js";

export const getRecommendedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Находим ID постов, которые пользователь лайкал или комментировал
    const likedPostIds = await Like.find({ user: userId }).distinct("post");
    const commentedPostIds = await Comment.find({ user: userId }).distinct(
      "post"
    );

    const interestPostIds = [
      ...new Set([...likedPostIds, ...commentedPostIds]),
    ];

    const interestingPosts = await Post.find({ _id: { $in: interestPostIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const remainingLimit = limit - interestingPosts.length;

    let randomPosts = [];

    if (remainingLimit > 0) {
      // случайные посты, исключая те, которые уже есть в интересных
      const excludedIds = new Set(
        interestingPosts.map((p) => p._id.toString())
      );
      const allInterestPostIds = [...excludedIds];

      // исключим уже просмотренные посты с предыдущих страниц
      if (page > 1) {
        const allPreviousIds = await Post.find({})
          .sort({ createdAt: -1 })
          .skip(0)
          .limit(skip);
        allPreviousIds.forEach((p) => excludedIds.add(p._id.toString()));
      }

      randomPosts = await Post.find({ _id: { $nin: Array.from(excludedIds) } })
        .sort({ createdAt: -1 })
        .limit(remainingLimit);
    }

    // Объединяем посты и убираем дубликаты окончательно
    const combinedPosts = [...interestingPosts, ...randomPosts];

    const uniquePosts = Array.from(
      new Map(combinedPosts.map((post) => [post._id.toString(), post])).values()
    );

    res.json({
      posts: uniquePosts,
      hasMore: uniquePosts.length === limit,
    });
  } catch (err) {
    console.error("Ошибка в getRecommendedPosts:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
