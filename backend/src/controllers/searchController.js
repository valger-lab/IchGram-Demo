import { User } from "../models/userModel.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      username: { $regex: `^${query}`, $options: "i" }, // нечувствительно к регистру
    }).select("username avatar"); // только нужные поля

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const searchController = {
  searchUsers,
};
