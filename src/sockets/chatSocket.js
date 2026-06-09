// src/sockets/chatSocket.js
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; // Ensure .js extension is present for ESM
import { saveAndProcessMessage } from '../controllers/chat.controller.js';

export const registerChatSocket = (io) => {
    // 1. Socket authentication handshake middleware
    io.use(async (socket, next) => {
        // Safe verification fallback using optional chaining (?.)
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error("Authentication failure: Token missing."));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Query the database to ensure the user's live verification status is active
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new Error("Authentication failure: User account not found."));
            }

            // CRITICAL CHECK: Block socket connection if they are not verified
            if (!user.isVerified) {
                return next(new Error("Access Denied: Unverified accounts cannot connect to the chat network."));
            }

            // Inject the verified user payload directly into the socket object
            socket.user = user;
            next();
        } catch (err) {
            return next(new Error("Authentication failure: Invalid signature token."));
        }
    });

    // 2. Continuous Real-time Connection Pipelines
    io.on('connection', (socket) => {
        console.log(`Verified user connected to socket: ${socket.user.fullName} (${socket.user.id})`);

        // Event listener to put a buyer and seller in an isolated conversation channel
        socket.on('joinChatRoom', ({ chatId }) => {
            socket.join(chatId);
            console.log(`🚪 User ${socket.user.fullName} entered room channel: ${chatId}`);
        });

        // Event listener to parse, filter, and stream text strings
        socket.on('sendMessage', async ({ chatId, text }) => {
            try {
                // Double-enforcement guard clause inside the stream pipe
                if (!socket.user.isVerified) {
                    return socket.emit('error', { message: "Action blocked: Account is unverified." });
                }

                // Pass message payload to controller -> database persistence
                const processedMsg = await saveAndProcessMessage(chatId, socket.user.id, text);
                
                // Stream down cleanly to everyone inside the room
                io.to(chatId).emit('messageReceived', processedMsg);

                // Broadcast security notification if AI flags off-platform trade manipulation keywords
                if (processedMsg.isFlagged) {
                    io.to(chatId).emit('systemSafetyWarning', {
                        message: "⚠️ Warning: For your security, keep all transactions and communication inside HaHu Market. Do not bypass the escrow system."
                    });
                }
            } catch (error) {
                socket.emit('error', { message: "Message could not be processed." });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected from socket layer: ${socket.user.fullName}`);
        });
    });
};