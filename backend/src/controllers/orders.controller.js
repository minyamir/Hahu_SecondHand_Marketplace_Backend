import mongoose from 'mongoose';
import * as OrderService from '../services/orders.service.js';
import { createNotification } from '../services/notification.service.js';

// ዋናው የ Escrow ግብይት ኮንትሮለር
export const initiateEscrowPurchase = async (req, res, next) => { // 'next'ን መጨመርዎን አይርሱ
    const isReplicaSet = mongoose.connection.readyState === 1 && mongoose.connection.db.serverConfig?.ismaster?.setName;

    let session = null;
    if (isReplicaSet) {
        session = await mongoose.startSession();
        session.startTransaction();
    } 

    try {
        const { listingId } = req.body;
        const buyerId = req.user._id;

        const order = await OrderService.processEscrowPurchaseService(buyerId, listingId, session);
        
        if (session) await session.commitTransaction();
        
        return res.status(201).json({ 
            success: true, 
            message: "Funds successfully locked in escrow.",
            data: order 
        });
    } catch (error) {
        if (session) await session.abortTransaction();

        // 1. ማሳወቂያ መላክ (የሚጠበቀው ስራ)

        // ተጠቃሚው በቂ ገንዘብ ከሌለው
    if (error.message === "Insufficient funds.") {
        await createNotification({
            userId: req.user._id, // የገዢው ID
            title: "❌ Transaction Failed",
            message: "Your wallet does not have enough amount of money to complete this purchase.",
            type: "order_failed"
        });
    }
       else { await createNotification({
            userId: req.user.id || req.user._id,
            title: "❌ Transaction Failed",
            message: error.message || "Your purchase could not be completed.",
            type: "order_failed"
        });
       }
        // 2. ስህተቱን ለ Middleware ማስተላለፍ
        // res.status መጠቀም ከፈለጉ፣ return ማድረግዎን ያረጋግጡ
        return res.status(400).json({ success: false, message: error.message });
          
    } finally {
        if (session) session.endSession();
    }
};

// Get Order by ID
export const getOrder = async (req, res) => {
    try {
        const order = await OrderService.getOrderByIdService(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// order.controller.js
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id: orderId } = req.params;
        let updatedOrder;

        if (status === 'completed') {
            // Service-ው ማሳወቂያውን ስለሚልክ እዚህ ጋር እንደገና መላክ አያስፈልግም
            updatedOrder = await OrderService.completeOrderService(orderId);
        } else {
            updatedOrder = await OrderService.updateOrderStatusService(orderId, status);
        }
        
        return res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};