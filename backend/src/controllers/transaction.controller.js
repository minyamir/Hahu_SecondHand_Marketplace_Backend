import { Transaction } from "../models/Transaction.model.js";

export const getMyTransactions = async (req, res) => {
    try {
        // Find transactions for the logged-in user
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 }); // Newest first
        
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPlatformEarnings = async (req, res) => {
    try {
        // Find all platform fee transactions
        const earnings = await Transaction.find({ type: 'platform_fee' });
        
        // Calculate total
        const total = earnings.reduce((sum, t) => sum + t.amount, 0);
        
        res.status(200).json({ success: true, total, earnings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};