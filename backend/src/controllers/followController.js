import { Follow } from "../models/followModel.js";
import { Notification } from "../models/notificationModel.js";

export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return res
        .status(400)
        .json({ message: "Not allowed to follow yourself" });
    }

    const existing = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existing) {
      return res.status(200).json({ message: "you are already following" });
    }

    const follow = new Follow({ follower: followerId, following: followingId });
    await follow.save();

    await Notification.create({
      type: "follow",
      sender: req.user._id,
      receiver: followingId,
    });

    res.status(200).json({ message: "you are now following" });
  } catch (err) {
    res.status(500).json({ message: "error while following" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    res.status(200).json({ message: "you are no longer following" });
  } catch (err) {
    res.status(500).json({ message: "error while unfollowing" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username avatar"
    );

    res.status(200).json(followers.map((f) => f.follower));
  } catch (err) {
    res.status(500).json({ message: "error while getting followers" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username avatar"
    );

    res.status(200).json(following.map((f) => f.following));
  } catch (err) {
    res.status(500).json({ message: "error while getting following" });
  }
};

export const followController = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
