// src/controllers/chat.controller.js
import * as chatService from '../services/chat.service.js';

/**
 * @desc    Initialize or retrieve an existing chat room for a listing
 * @route   POST /api/chats/initiate
 * @access  Private (Verified Only via Middleware)
 */
// src/controllers/chat.controller.js

export const initializeChatRoom = async (req, res) => {
    try {
        // Change 'sellerId' to 'targetUserId' to match your "Participant-Based" flow
        const { listingId, targetUserId } = req.body; 
        const currentUserId = req.user.id;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot initiate a trade chat with yourself." 
            });
        }

        // Logic remains the same, but now it's semantic and clear
        const chat = await chatService.createOrGetChat(listingId, currentUserId, targetUserId);

        return res.status(200).json({ success: true, data: chat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Fetch all chat rooms for the logged-in user
 * @route   GET /api/chats
 * @access  Private (Verified Only)
 */
export const fetchUserChats = async (req, res) => {
    try {
        const chats = await chatService.getUserChatRooms(req.user.id);
        
        return res.status(200).json({ 
            success: true, 
            data: chats 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * @desc    Fetch all historical messages for a specific room
 * @route   GET /api/chats/:chatId/messages
 * @access  Private (Verified Only)
 */
export const fetchChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await chatService.getRoomMessages(chatId);
        
        return res.status(200).json({ 
            success: true, 
            data: messages 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * @desc    Internal Helper logic to analyze off-platform trade manipulation risks
 * @param   {String} text 
 * @returns {Object} { isFlagged, reason }
 */
const inspectMessageRisk = (text) => {
    const riskPatterns = [
        /(09|07)\d{8}/g,                   // Direct Ethiopian phone formats (09... / 07...)
        /telegram/i, /viber/i, /call me/i,   // Off-platform platform keywords
        /telebirr/i, /cbe/i, /account/i     // Payment bypassing risks
    ];
    
    const matched = riskPatterns.some(pattern => pattern.test(text));
    return matched 
        ? { isFlagged: true, reason: "Detected off-platform transaction attempt." } 
        : { isFlagged: false, reason: null };
};

/**
 * @desc    Processes and persists real-time messages coming from the socket pipe
 * @param   {String} chatId 
 * @param   {String} senderId 
 * @param   {String} text 
 */
export const saveAndProcessMessage = async (chatId, senderId, text) => {
    // Run content analysis through risk filters
    const moderation = inspectMessageRisk(text);
    
    // Save to database via service execution block
    const message = await chatService.saveNewMessage({
        chatId,
        senderId,
        text,
        isFlagged: moderation.isFlagged,
        flaggedReason: moderation.reason
    });

    return message;
};