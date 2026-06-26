import * as notificationService from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user.id
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications =
      await notificationService.getUnreadNotifications(req.user.id);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification =
      await notificationService.markNotificationAsRead(
        req.params.id,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Notification deleted"
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAllNotifications = async (req, res, next) => {
  try {
    await notificationService.deleteAllNotifications(req.user.id);

    res.status(200).json({
      success: true,
      message: "All notifications deleted"
    });
  } catch (err) {
    next(err);
  }
};

/*
|--------------------------------------------------------------------------
| TEST REALTIME NOTIFICATION
|--------------------------------------------------------------------------
*/

export const testNotification = async (req, res, next) => {
  try {
    const notification =
      await notificationService.createNotification({
        userId: req.user.id,
        title: "🚀 Test Notification",
        message: "Realtime notification is working successfully.",
        type: "system"
      });

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};