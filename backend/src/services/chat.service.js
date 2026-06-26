// src/services/chat.service.js
import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';

export const createOrGetChat = async (listingId, buyerId, sellerId) => {
    // Check if a unique chat room already exists for this exact item between these users
    let chat = await Chat.findOne({
        listing: listingId,
        participants: {     $all: [buyerId, sellerId] }
    });

    // If no prior conversation room exists, instantiate a fresh tracking schema
    if (!chat) {
        chat = await Chat.create({
            listing: listingId,
            participants: [buyerId, sellerId]
        });
    }

    return chat;
};

export const getUserChatRooms = async (userId) => {
    // Fetch all active dialogue channels where the targeted authenticated user is a participant
    return await Chat.find({ participants: userId })
        .populate('participants', 'fullName email isVerified')
        .populate('listing', 'title price images location')
        .populate('lastMessage')
        .sort({ updatedAt: -1 }); // Pushes channels with active recent text threads to the top
};

export const getRoomMessages = async (chatId) => {
    // Queries historical records for room streams
    return await Message.find({ chatId })
        .populate('sender', 'fullName isVerified')
        .sort({ createdAt: 1 }); // Ascending layout ensures standard narrative timeline
};

/**
 * @desc    Persist a fresh incoming message and link it as the chat's lastMessage reference
 * @param   {Object} messageData 
 * @returns {Object} Saved message document
 */
export const saveNewMessage = async ({ chatId, senderId, text, isFlagged, flaggedReason }) => {
    // 1. Create and save the message text log
    const message = await Message.create({
        chatId,
        sender: senderId,
        text,
        isFlagged,
        flaggedReason
    });

    // 2. Update the parent Chat room's lastMessage pointer and updatedAt timestamp
    await Chat.findByIdAndUpdate(chatId, { 
        lastMessage: message._id 
    });

    return message;
};