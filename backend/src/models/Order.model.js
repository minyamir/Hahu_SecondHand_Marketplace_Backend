import mongoose, { Schema, model } from 'mongoose';

const OrderSchema = new Schema({
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: Schema.Types.ObjectId,
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

export default model('Order', OrderSchema);