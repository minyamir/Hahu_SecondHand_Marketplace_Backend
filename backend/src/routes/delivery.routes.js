import express from "express";
import { protect, isAdmin } from "../middleware/auth.middleware.js";
import { 
    createDeliveryController, 
    assignDriverController, 
    updateStatusController 
} from "../controllers/delivery.controller.js";

const router = express.Router();

// Delivery መፍጠር (ለምሳሌ ትዕዛዝ ሲረጋገጥ በስርዓቱ የሚፈጠር)
router.post("/", protect, createDeliveryController);

// ሾፌር መመደብ (Admin ብቻ)
router.post("/assign", protect, isAdmin, assignDriverController);

// የDelivery ሁኔታን ማዘመን (ለምሳሌ: picked_up, delivered)
// ሾፌሩም ሆነ አድሚኑ ማዘመን እንዲችሉ
router.patch("/:deliveryId/status", protect, updateStatusController);

export default router;