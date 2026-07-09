import mongoose from "mongoose";
import User from "../models/User.model.js"; // ስህተትን ለመከላከል { } ን አውጥተናል
import { Transaction } from "../models/Transaction.model.js";
import { createNotification } from "./notification.service.js"; 
// 1. LOCK PAYMENT
export const lockPayment = async (buyerId, sellerId, amount, orderId) => {
    // 1. Update user balance directly
    const buyer = await User.findByIdAndUpdate(
        buyerId, 
        { $inc: { walletBalance: -amount } }, 
        { new: true }
    );

    if (!buyer || buyer.walletBalance < 0) {
        throw new Error("Insufficient funds for escrow.");
    }

    // 2. Create the transaction record
    const transaction = await Transaction.create({
        userId: buyerId,
        orderId: orderId,
        amount: -Math.abs(amount),
        type: "escrow_locked",
        description: `Payment locked in escrow for order ${orderId}`
    });

    // 3. Trigger Notifications (ከ return በፊት መሆን አለበት!)
    await createNotification({
        userId: buyerId,
        title: "Payment Locked",
        message: `Payment of ${amount} ETB for order ${orderId} has been successfully locked in escrow.`,
        type: "escrow_locked"
    });

    await createNotification({
        userId: sellerId,
        title: "New Order Payment",
        message: `Payment of ${amount} ETB for order ${orderId} is secured. You can now proceed with the delivery.`,
        type: "escrow_locked"
    });

    // 4. መጨረሻ ላይ return ያድርጉ
    return transaction;
}

// 2. RELEASE PAYMENT
export const releasePayment = async (orderId, sellerId, amount) => {
    // 1. የሻጩን ሂሳብ መጨመር (ያለ session)
    const seller = await User.findByIdAndUpdate(
        sellerId, 
        { $inc: { walletBalance: amount } }, 
        { new: true }
    );

    if (!seller) throw new Error("Seller not found.");

    // 2. የግብይት መዝገብ መፍጠር (ያለ session)
    const transaction = await Transaction.create({
        userId: sellerId,
        orderId: orderId,
        amount: amount,
        type: "escrow_released",
        description: `Payment released for order ${orderId}`
    });
         // 4. Trigger Notification (for Release)
                await createNotification({
                    userId: sellerId,
                    title: "Payment Released",
                    message: `Great news! Payment of ${amount} ETB for order ${orderId} has been released to your wallet.`,
                    type: "escrow_released"
                });
    return transaction;
};

// 3. REFUND PAYMENT (የጻፍከው)
export const refundPayment = async (orderId, buyerId, amount) => {
    // 1. የገዢውን ሂሳብ መመለስ (walletBalance መጨመር)
    const buyer = await User.findByIdAndUpdate(
        buyerId, 
        { $inc: { walletBalance: amount } }, 
        { new: true }
    );

    if (!buyer) throw new Error("Buyer not found.");

    // 2. የግብይት መዝገብ መፍጠር
    const transaction = await Transaction.create({
        userId: buyerId,
        orderId: orderId,
        amount: amount,
        type: "escrow_refunded",
        description: `Payment refunded for order ${orderId}`
    });
        await createNotification({
        userId: buyerId,
        title: "Refund Processed",
        message: `Your refund of ${amount} ETB for order ${orderId} has been processed.`,
        type: "escrow_refunded"
    });
    return transaction;
};