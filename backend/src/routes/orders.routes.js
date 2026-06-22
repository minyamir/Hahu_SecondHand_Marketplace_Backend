import { Router } from 'express';
import { initiateEscrowPurchase } from '../controllers/orders.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // የ User መለያ ማረጋገጫ
import { isVerified } from '../middleware/verified.middleware.js'; // የ Verified መሆኑን ማረጋገጫ
import { getOrder, updateOrderStatus } from '../controllers/orders.controller.js';
const router = Router();

// ትዕዛዝ ለመፍጠር የሚጠቅም Route
// 1. protect: ተጠቃሚው ገብቷል ወይስ አልገባም?
// 2. isVerified: ተጠቃሚው ተረጋግጧል (Verified user) ወይስ አይደለም?
router.post('/initiate', protect, isVerified, initiateEscrowPurchase);
// በዚሁ በ router.js ፋይል ውስጥ እነዚህን ጨምር:
router.get('/:id', protect, getOrder); // የአንድን ትዕዛዝ ዝርዝር ለማየት
router.patch('/:id', protect, updateOrderStatus); // የትዕዛዙን ሁኔታ (Status) ለመቀየር (ለምሳሌ: completed)

export default router;