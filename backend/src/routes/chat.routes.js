// src/routes/chat.routes.js
import express from 'express';
import { initializeChatRoom, fetchUserChats, fetchChatMessages } from '../controllers/chat.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import verifiedMiddleware from '../middleware/verified.middleware.js';


const router = express.Router();

// Enforce authentication AND identity verification across all chat operations
router.use(authMiddleware);
router.use(verifiedMiddleware);

// POST /api/chats/initiate -> Setup or get a room
router.post('/initiate', initializeChatRoom);

// GET /api/chats -> Pull active chat history list for dashboard feed
router.get('/', fetchUserChats);

// GET /api/chats/:chatId/messages -> Pull historical text arrays inside a specific room
router.get('/:chatId/messages', fetchChatMessages);

export default router;