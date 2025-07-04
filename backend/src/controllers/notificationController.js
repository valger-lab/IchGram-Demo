import { Notification } from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate("sender", "username avatar")
      .populate("post", "image videoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении уведомлений" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Уведомление не найдено" });
    }

    if (!notification.receiver.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Нет доступа к этому уведомлению" });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении уведомления" });
  }
};

// Отметить все уведомления как прочитанные
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiver: req.user._id }, { isRead: true });
    res.status(200).json({ message: "Все уведомления прочитаны" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении уведомлений" });
  }
};
export const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.user._id, isRead: true });
    res.status(200).json({ message: "Прочитанные уведомления удалены" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении уведомлений" });
  }
};

export const notificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearReadNotifications,
};
