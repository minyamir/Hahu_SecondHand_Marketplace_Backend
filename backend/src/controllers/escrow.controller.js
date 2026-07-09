import * as escrowService from "../services/escrow.service.js";

// POST /api/escrow/lock
export const lockPaymentController = async (req, res) => {
    try {
        const { sellerId, amount, orderId } = req.body;
        const buyerId = req.user.id;
        
        const transaction = await escrowService.lockPayment(buyerId, sellerId, amount, orderId);
        
        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/escrow/release
export const releasePaymentController = async (req, res) => {
    try {
        const { orderId, sellerId, amount } = req.body;
        
        const transaction = await escrowService.releasePayment(orderId, sellerId, amount);
        
        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/escrow/refund
export const refundPaymentController = async (req, res) => {
    try {
        const { orderId, buyerId, amount } = req.body;
        
        const transaction = await escrowService.refundPayment(orderId, buyerId, amount);
        
        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};