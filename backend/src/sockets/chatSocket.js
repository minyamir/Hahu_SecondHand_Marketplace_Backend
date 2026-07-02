import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Chat from '../models/Chat.model.js'; // Ensure you import your Chat model
import { createOrGetChat } from '../services/chat.service.js';
import { saveAndProcessMessage } from '../controllers/chat.controller.js'; 
import { createNotification } from "../services/notification.service.js";
export const registerChatSocket = (io) => {
  io.use(async (socket, next) => {
    console.log("\n========== CHAT SOCKET ==========");
    console.log("Headers:", socket.handshake.headers);
    console.log("Query:", socket.handshake.query);
    console.log("Auth:", socket.handshake.auth);

    let token = null;

    // 1. Authorization Header
    const authHeader = socket.handshake.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }

    // 2. Query (?token=...)
    if (!token && socket.handshake.query?.token) {
        token = socket.handshake.query.token;
    }

    // 3. Auth
    if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
    }

    if (!token) {
        console.log("❌ TOKEN NOT FOUND");
        return next(new Error("Token missing"));
    }

    console.log("✅ TOKEN FOUND");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;

        console.log(`✅ ${user.fullName} authenticated`);

        next();

    } catch (err) {
        console.log("JWT ERROR:", err.message);
        next(new Error("Invalid token"));
    }
});

    io.on('connection', async (socket) => {
        console.log(`✅ ${socket.user.fullName} connected.`);

        // --- NEW: AUTO-JOIN LOGIC ---
        try {
            const userChats = await Chat.find({ participants: socket.user._id });
            userChats.forEach(chat => {
                socket.join(chat._id.toString());
                console.log(`📥 ${socket.user.fullName} auto-joined room: ${chat._id}`);
            });
        } catch (err) {
            console.error("❌ Auto-join failed:", err);
        }

        socket.on('sendMessage', async (data) => {
            const msgData = typeof data === 'string' ? JSON.parse(data) : data;
            
            try {
                const { targetUserId, listingId, text } = msgData;
                
                if (!targetUserId || !listingId || !text) {
                    throw new Error("Missing required fields");
                }

                const senderId = socket.user._id;
                const targetObjId = new mongoose.Types.ObjectId(targetUserId);
                const listingObjId = new mongoose.Types.ObjectId(listingId);

                // 1. Resolve or Create the room
                const chat = await createOrGetChat(listingObjId, senderId, targetObjId);
                const chatId = chat._id.toString();
                
                // 2. Process, Moderate, and Save
                const savedMessage = await saveAndProcessMessage(chatId, senderId, text);
                
                // 3. Join sender to room (in case they weren't) and Broadcast
                socket.join(chatId); 
                // socket.to(chatId) sends to everyone in room EXCEPT sender
                socket.to(chatId).emit('messageReceived', savedMessage);
                // ተጨማሪ: ለተቀባዩ (Target User) "አዲስ መልእክት አለህ" የሚል Notification መላክ
                        await createNotification({
                            userId: targetUserId,
                            title: "💬 New Message",
                            message: `You have a new message from ${socket.user.fullName}`,
                            type: "new_chat_message"
                        });
                console.log(`💾 SUCCESS: Message sent to room ${chatId}`);
            } catch (error) {
                console.error("❌ DEBUG: Detailed Error:", error); 
                socket.emit('error', { message: error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ ${socket.user.fullName} disconnected.`);
        });
    });
};