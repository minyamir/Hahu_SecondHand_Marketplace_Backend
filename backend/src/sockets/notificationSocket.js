import * as notificationService from "../services/notification.service.js";

export const registerNotificationSocket = (io) => {
  io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

    if (!userId) {
      console.log("Socket connection attempt without userId");
      return;
    }

    socket.join(`user_${userId}`);

    console.log(`🔔 User ${userId} connected`);

    socket.on("markAsRead", async (notificationId) => {
      try {
        const notification =
          await notificationService.markNotificationAsRead(
            notificationId,
            userId
          );

        socket.emit("notificationMarked", notification);
      } catch (err) {
        socket.emit("error", {
          message: err.message
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected`);
    });
  });
};