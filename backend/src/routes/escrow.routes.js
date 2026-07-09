import express from "express";
import { 
    lockPaymentController, 
    releasePaymentController, 
    refundPaymentController 
} from "../controllers/escrow.controller.js";
import {protect ,isAdmin} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/lock", protect, lockPaymentController);
router.post("/release", protect,isAdmin, releasePaymentController);
router.post("/refund", protect,isAdmin, refundPaymentController);

export default router;