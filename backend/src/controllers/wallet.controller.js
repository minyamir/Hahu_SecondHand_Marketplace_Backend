import * as walletService from "../services/wallet.service.js";
import User from "../models/User.model.js";

// 1. Fetch Summary (Balance + Transactions)
export const getWalletData = async (req, res) => {
    try {
        // Fetch user's current balances
        const user = await User.findById(req.user.id).select("walletBalance escrowBalance");
        
        // Fetch transaction history
        const transactions = await walletService.getUserTransactions(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                walletBalance: user.walletBalance,
                escrowBalance: user.escrowBalance,
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Deposit logic
export const deposit = async (req, res) => {
    try {
        const { amount, description } = req.body;
        
        const transaction = await walletService.addTransaction({
            userId: req.user.id,
            amount: amount,
            type: "deposit",
            description: description || "Manual deposit"
        });

        res.status(200).json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const withdraw = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id; // Assuming you have auth middleware

        // 1. Basic validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid withdrawal amount." });
        }

        // 2. Call the service
        // The service will handle the balance check and the transaction logic
        const transaction = await walletService.withdraw({
            userId,
            amount,
            description: description || "Withdrawal",
            type: "withdrawal"
        });

        // 3. Success response
        return res.status(200).json({
            success: true,
            message: "Withdrawal successful",
            data: transaction
        });

    } catch (error) {
        // 4. Handle errors (e.g., Insufficient Funds)
        return res.status(400).json({
            success: false,
            message: error.message || "Withdrawal failed"
        });
    }
};