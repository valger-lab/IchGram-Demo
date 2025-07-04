import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";
import { Follow } from "../models/followModel.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const postsCount = await Post.countDocuments({ author: user._id });
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      website: user.website,
      avatar: user.avatar,
      profileStyle: user.profileStyle,
      createdAt: user.createdAt,
      postsCount,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, bio, website, profileStyle } = req.body;

    // Обновляем простые поля
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;

    // Обновляем стиль профиля
    if (profileStyle === "null" || profileStyle === null) {
      // Удаляем стиль полностью
      user.profileStyle = undefined;
    } else if (typeof profileStyle === "string" && profileStyle.trim() !== "") {
      try {
        const parsedStyle = JSON.parse(profileStyle);

        const cleanedStyle = {};
        if (parsedStyle.bgColor && parsedStyle.bgColor.trim() !== "") {
          cleanedStyle.bgColor = parsedStyle.bgColor.trim();
        }
        if (parsedStyle.textColor && parsedStyle.textColor.trim() !== "") {
          cleanedStyle.textColor = parsedStyle.textColor.trim();
        }
        if (parsedStyle.headerImage && parsedStyle.headerImage.trim() !== "") {
          cleanedStyle.headerImage = parsedStyle.headerImage.trim();
        }

        if (Object.keys(cleanedStyle).length > 0) {
          user.profileStyle = cleanedStyle;
        } else {
          // Если нет ни одного значения, удаляем стиль
          user.profileStyle = undefined;
        }
      } catch (e) {
        console.warn("Невозможно распарсить profileStyle:", e.message);
      }
    } else if (profileStyle === undefined) {
      // Если profileStyle не передан, оставляем как есть — не меняем
    } else {
      // Если передан пустой, удаляем стиль
      user.profileStyle = undefined;
    }

    // Обработка аватара
    if (req.file) {
      if (user.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(user.avatarPublicId);
        } catch (e) {
          console.warn("Ошибка при удалении старого аватара:", e.message);
        }
      }
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    await user.save();

    return res.json(user);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user заполняется в middleware protect
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const postsCount = await Post.countDocuments({ author: req.user._id });
    const followersCount = await Follow.countDocuments({
      following: req.user._id,
    });
    const followingCount = await Follow.countDocuments({
      follower: req.user._id,
    });

    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      website: user.website,
      avatar: user.avatar,
      profileStyle: user.profileStyle,
      createdAt: user.createdAt,
      postsCount,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Получаем всех пользователей, исключая поле password
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
