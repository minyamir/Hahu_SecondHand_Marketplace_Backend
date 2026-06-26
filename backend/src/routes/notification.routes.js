import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  testNotification
} from "../controllers/notification.controller.js";

const router = Router();

// Protect all notification routes
router.use(protect);

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

// Get all notifications
router.get("/", getNotifications);

// Get unread notifications
router.get("/unread", getUnreadNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
*/

// Mark one notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

// Delete one notification
router.delete("/:id", deleteNotification);

// Delete all notifications
router.delete("/", deleteAllNotifications);

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

// Send a realtime test notification
router.post("/test", testNotification);

export default router;