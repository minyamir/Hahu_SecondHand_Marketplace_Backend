// routes/wallet.routes.js
import express from "express";
import { getWalletData, deposit } from "../controllers/wallet.controller.js";
import { protect } from "../middleware/auth.middleware.js"; // Ensure your auth middleware is imported

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/summary", getWalletData); // Fetch balance and history
router.post("/deposit", deposit);      // Trigger a deposit

export default router;