import { Transaction } from "../models/Transaction.model.js";
import User from "../models/User.model.js"; // Import your User model
import { io } from "../sockets/socketServer.js";
import { createNotification } from "./notification.service.js"; // Import your notification service
// Get history of transactions
export const getUserTransactions = async (userId) => {
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
};

// Add a transaction and update User balance

export const addTransaction = async (data) => {
    // 1. Create the transaction record
    const transaction = await Transaction.create(data);

    // 2. Update the balance
    const updatedUser = await User.findByIdAndUpdate(
        data.userId,
        { $inc: { walletBalance: data.amount } },
        { returnDocument: 'after', upsert: true }
    );

    // 3. Trigger notification and CAPTURE the result
    const notification = await createNotification({ // <--- Capture this!
        userId: data.userId,
        title: "Deposit Successful",
        message: `Your wallet has been updated by ${data.amount} ETB.`,
        type: "wallet_deposit"
    });

    // 4. Broadcast updates
    io.to(`wallet_${data.userId}`).emit("walletUpdated", {
        balance: updatedUser.walletBalance,
        newTransaction: transaction
    });

    // Now 'notification' is defined and safe to emit
   // io.to(`wallet_${data.userId}`).emit("newNotification", notification);

    return transaction;
};

