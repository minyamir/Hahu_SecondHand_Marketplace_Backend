import * as deliveryService from "../services/delivery.service.js";
import Delivery from "../models/Delivery.model.js"; // ሞዴሉን import አድርግ
import Order from "../models/Order.model.js";
import { releasePayment } from "../services/escrow.service.js"; // Escrow service import አድርግ

// 1. Create Delivery
export const createDeliveryController = async (req, res) => {
    try {
        const { orderId, sellerId, buyerId } = req.body;
        const delivery = await deliveryService.createDelivery({ orderId, sellerId, buyerId });
        res.status(201).json({ success: true, data: delivery });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 2. Assign Driver (Admin only)
export const assignDriverController = async (req, res) => {
    try {
        const { deliveryId, driverId } = req.body;
        const delivery = await deliveryService.assignDriver(deliveryId, driverId);
        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 3. Update Delivery Status (Driver/Seller/Buyer)
export const updateStatusController = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { status } = req.body;
        const userId = req.user._id.toString();

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) return res.status(404).json({ message: "Delivery not found" });

        // 1. Authorization Logic
        if (status === "confirmed") {
            if (delivery.buyerId.toString() !== userId) {
                return res.status(403).json({ success: false, message: "Only the buyer can confirm delivery!" });
            }
        }

        // 2. Status ማዘመን
        const updatedDelivery = await deliveryService.updateDeliveryStatus(deliveryId, status);

        // 3. Escrow Logic: አንድ ጊዜ ብቻ ነው የምንጠራው!
        if (status === "confirmed") {
            const order = await Order.findById(delivery.orderId);
            if (!order) {
                throw new Error("Order data not found for payment release");
            }

            // ትክክለኛውን amountPaid በመጠቀም ክፍያ መለቀቅ
            await releasePayment(delivery.orderId, delivery.sellerId, order.amountPaid);
            console.log(`Payment of ${order.amountPaid} released for Order: ${delivery.orderId}`);
        }
        
        // 4. ስኬታማ ምላሽ
        return res.status(200).json({ success: true, data: updatedDelivery });

    } catch (error) {
        // ስህተትን በግልፅ ለማየት
        console.error("Controller Error:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};