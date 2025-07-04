import { Message } from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!text || !receiverId) {
      return res
        .status(400)
        .json({ message: "Текст и получатель обязательны" });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при отправке сообщения" });
  }
};

export const getChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    // Помечаем как прочитанные
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при получении чата" });
  }
};

export const getContacts = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).populate("sender receiver", "username avatar");

    const contactMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === req.user._id.toString()
          ? msg.receiver
          : msg.sender;

      contactMap.set(otherUser._id.toString(), otherUser);
    });

    res.json([...contactMap.values()]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при получении контактов" });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при получении непрочитанных" });
  }
};

export const deleteMessages = async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.userId;

  try {
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    });

    res.sendStatus(204);
  } catch (err) {
    console.error("Ошибка при удалении сообщений:", err);
    res.status(500).json({ message: "Не удалось удалить сообщения" });
  }
};

export const messageController = {
  sendMessage,
  getChat,
  getContacts,
  getUnreadCounts,
  deleteMessages,
};
