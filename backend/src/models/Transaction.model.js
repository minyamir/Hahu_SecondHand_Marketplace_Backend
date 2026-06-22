import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['sale_payout', 'platform_fee', 'deposit', 'withdrawal'], 
        required: true 
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model("Transaction", transactionSchema);