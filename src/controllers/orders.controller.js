const Order = require('../models/Order.model');
const Listing = require('../models/Listing.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');

export const initiateEscrowPurchase = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { listingId } = req.body;
        const buyerId = req.user.id;

        const listing = await Listing.findById(listingId).session(session);
        if (!listing || listing.isSold) {
            return res.status(404).json({ success: false, message: "Listing is unavailable or already sold." });
        }

        const buyer = await User.findById(buyerId).session(session);
        if (buyer.walletBalance < listing.price) {
            return res.status(400).json({ success: false, message: "Insufficient wallet funds. Please recharge your account balance." });
        }

        const commissionPercentage = 0.05; // 5% flat marketplace processing tier commission
        const platformFee = listing.price * commissionPercentage;
        const netSellerPayout = listing.price - platformFee;

        // 1. Deduct total price from the buyer's liquid balance
        buyer.walletBalance -= listing.price;
        await buyer.save({ session });

        // 2. Lock net payout securely inside the seller's escrow suspension balance pool
        const seller = await User.findById(listing.seller).session(session);
        seller.escrowBalance += netSellerPayout;
        await seller.save({ session });

        // 3. Flag listing status to prevent parallel checkout loops
        listing.isSold = true;
        await listing.save({ session });

        // 4. Generate the unalterable Ledger Order record
        const order = await Order.create([{
            buyer: buyerId,
            seller: listing.seller,
            listing: listingId,
            amountPaid: listing.price,
            platformFee: platformFee,
            status: 'escrow_locked'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Funds successfully locked securely in escrow holding pool.",
            data: order[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};