const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['escrow_locked', 'dispatched', 'delivered', 'completed', 'refunded'],
        default: 'escrow_locked'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);