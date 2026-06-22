import mongoose from 'mongoose';
import * as OrderService from '../services/orders.service.js';

// Initiate Escrow Purchase
export const initiateEscrowPurchase = async (req, res) => {
    // Check if the environment supports transactions
    const isReplicaSet = mongoose.connection.readyState === 1 && mongoose.connection.db.serverConfig?.ismaster?.setName;

    let session = null;
    if (isReplicaSet) {
        session = await mongoose.startSession();
        session.startTransaction();
    }

    try {
        const { listingId } = req.body;
        const buyerId = req.user._id;

        // Pass the session (or null) to the service
        const order = await OrderService.processEscrowPurchaseService(buyerId, listingId, session);
        
        if (session) await session.commitTransaction();
        
        res.status(201).json({ 
            success: true, 
            message: "Funds successfully locked in escrow.",
            data: order 
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
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

// Update Order Status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let updatedOrder;

        if (status === 'completed') {
            updatedOrder = await OrderService.completeOrderService(req.params.id);
        } else {
            // Handle other status updates
            updatedOrder = await OrderService.updateOrderStatusService(req.params.id, status);
        }
        
        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};