import Order from '../models/Order.model.js';
import Listing from '../models/Listing.model.js';
import User from '../models/User.model.js';
import { Transaction } from "../models/Transaction.model.js"; // Import your new model

// ዋናው የ Escrow ግብይት ስራ
export const processEscrowPurchaseService = async (buyerId, listingId, session) => {
    // 1. ሊስቲንግ መፈተሽ
    const listing = await Listing.findById(listingId).session(session);
    if (!listing || listing.isSold) throw new Error("Listing unavailable.");

    // 2. ገዢ መፈተሽ
    const buyer = await User.findById(buyerId).session(session);
    if (!buyer || buyer.walletBalance < listing.price) throw new Error("Insufficient funds.");

    // 3. ስሌት
    const platformFee = listing.price * 0.05;
    const netSellerPayout = listing.price - platformFee;

    // 4. ሂሳብ ማስተካከያ
    buyer.walletBalance -= listing.price;
    await buyer.save({ session });

    const seller = await User.findById(listing.seller).session(session);
    seller.escrowBalance += netSellerPayout;
    await seller.save({ session });

    listing.isSold = true;
    await listing.save({ session });

    // 5. Order መፍጠር
    const [order] = await Order.create([{
        buyer: buyerId,
        seller: listing.seller,
        listing: listingId,
        amountPaid: listing.price,
        platformFee,
        status: 'escrow_locked'
    }], { session });

    return order;
};

// ቀደም ብለህ የጻፍካቸው Utility functions
export const getOrderByIdService = async (orderId) => {
    return await Order.findById(orderId).populate('buyer seller listing');
};

export const updateOrderStatusService = async (orderId, newStatus) => {
    return await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
};


export const completeOrderService = async (orderId) => {
    // 1. Find the order
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'escrow_locked') {
        throw new Error("Order not found or already processed.");
    }

    const netPayout = order.amountPaid - order.platformFee;

    // 2. Atomically update the Seller's balance
    const updatedSeller = await User.findByIdAndUpdate(
        order.seller,
        {
            $inc: { 
                walletBalance: netPayout, 
                escrowBalance: -order.amountPaid // Assuming you moved the full amount to escrow initially
            }
        },
        { new: true }
    );

    if (!updatedSeller) throw new Error("Seller not found.");

    // 3. LOG: Create Transaction for the Seller (The 475)
    await Transaction.create({
        userId: order.seller,
        orderId: order._id,
        amount: netPayout,
        type: 'sale_payout',
        description: `Payout for order ${order._id}`
    });

    // 4. LOG: Create Transaction for the Platform Fee (The 25)
    // You can point this to an ADMIN_ID or a 'system' user
    await Transaction.create({
        userId: "6a2db8dbcacb80d5cd8ef0cc", // Replace with your actual Admin/System ID
        orderId: order._id,
        amount: order.platformFee,
        type: 'platform_fee',
        description: `Platform commission for order ${order._id}`
    });

    // 5. Finalize Order status
    order.status = 'completed';
    await order.save();

    return order;
};