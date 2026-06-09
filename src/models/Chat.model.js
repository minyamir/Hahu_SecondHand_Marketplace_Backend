// src/models/Chat.model.js
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

// Ensure a buyer and seller can only have one unique chat room per specific listing
ChatSchema.index({ participants: 1, listing: 1 }, { unique: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat; // 🟢 Clean ESM Default Export