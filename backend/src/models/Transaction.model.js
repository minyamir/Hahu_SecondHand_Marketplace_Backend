import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },

    amount: {
      type: Number,
      required: true
    },

    type: {
      type: String,
      enum: [
        "deposit",
        "wallet_withdrawal",
        "wallet_deposit",

        "purchase",
        "sale_payout",

        "escrow_locked",
        "escrow_released",

        "refund",

        "platform_fee"
      ],
      required: true
    },

    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);