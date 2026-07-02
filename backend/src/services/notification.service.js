import { Notification } from "../models/Notification.model.js";
import { io } from "../sockets/socketServer.js";

export const createNotification = async ({ userId, title, message, type, data = {} }) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    data
  });

  // 1. Generic Event: ለሁሉም አዲስ Frontend ኮድ (ይህ እየሰራ ነው)
  io.to(`user_${userId}`).emit("newNotification", notification);

  // 2. Specific Event: ለድሮው የ Frontend Listener (ለ order_completed, order_created, ወዘተ)
  // ይህ መስመር ነው Frontend-ው ላይ 'order_completed' ማሳወቂያው እንዲታይ የሚያደርገው
  io.to(`user_${userId}`).emit(type, notification);

  console.log(`[Socket] Notification emitted: generic 'newNotification' and specific '${type}'`);
  
  return notification;
};
export const getNotifications = async (userId) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 });
};

export const getUnreadNotifications = async (userId) => {
  return await Notification.find({
    userId,
    isRead: false
  }).sort({ createdAt: -1 });
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    userId,
    isRead: false
  });
};

export const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const notification =
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

export const markAllNotificationsAsRead = async (
  userId
) => {
  await Notification.updateMany(
    {
      userId,
      isRead: false
    },
    {
      isRead: true
    }
  );

  return {
    success: true
  };
};

export const deleteNotification = async (
  notificationId,
  userId
) => {
  await Notification.findOneAndDelete({
    _id: notificationId,
    userId
  });

  return {
    success: true
  };
};

export const deleteAllNotifications = async (
  userId
) => {
  await Notification.deleteMany({
    userId
  });

  return {
    success: true
  };
};