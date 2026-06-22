import express from 'express';
import { getMyTransactions } from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Assuming you have auth middleware

const router = express.Router();

// GET /api/transactions/my-history
router.get('/my-history', protect, getMyTransactions);

export default router;