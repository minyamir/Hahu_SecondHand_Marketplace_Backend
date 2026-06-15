import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js'; // Your standard JWT auth
import { isAdmin } from '../middleware/admin.middleware.js';

import { 
    getPendingVerifications, 
    getVerificationDetails, 
    processVerification 
} from '../controllers/admin.controller.js';

const router = express.Router();

// Apply these to all admin routes
router.use(authMiddleware, isAdmin);

router.get("/pending", getPendingVerifications);
router.get("/details/:userId", getVerificationDetails);
router.post("/process", processVerification);

export default router;