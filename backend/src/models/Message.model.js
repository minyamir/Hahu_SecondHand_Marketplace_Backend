// src/models/Message.model.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    flaggedReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
export default Message; // 🟢 Clean ESM Default Export