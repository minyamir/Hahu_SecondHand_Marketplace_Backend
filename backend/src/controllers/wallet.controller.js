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