import express from 'express';
import { handleVerificationSubmit } from '../controllers/verification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Define only the 3 fields now required by your model
const uploadFields = upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'livenessVideo', maxCount: 1 }
]);

// Apply to your POST route
router.post('/submit', authMiddleware, uploadFields, handleVerificationSubmit);

export default router;