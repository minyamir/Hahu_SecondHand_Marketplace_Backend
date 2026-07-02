import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "verification_submitted",
        "verification_approved",
        "verification_rejected",

        "listing_created",
        "listing_approved",
        "listing_rejected",
        "listing_liked",

        "new_chat_message",

        "order_created",
        "order_accepted",
        "order_rejected",
        "order_completed",
        "order_failed",
       "escrow_locked",
        "escrow_released",
        "escrow_refunded",
        "system"
      ],
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    data: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      },

      listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
      },

      chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
      }
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);