import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import listingsRoutes from "./listings.routes.js";
import verificationRoutes from "./verification.routes.js";
import chatRoutes from "./chat.routes.js";
import ordersRoutes from "./orders.routes.js";
import reportsRoutes from "./reports.routes.js";
import adminRoutes from "./admin.routes.js";
import notificationRoutes from "./notification.routes.js";
import walletRoutes from "./wallet.routes.js";
import escrowRoutes from "./escrow.routes.js";
import transactionRoutes from "./transaction.routes.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/listings", listingsRoutes);
router.use("/verification", verificationRoutes);
router.use("/chat", chatRoutes);
router.use("/orders", ordersRoutes);
router.use("/reports", reportsRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/wallet", walletRoutes);
router.use("/escrow", escrowRoutes);
router.use("/transactions", transactionRoutes);

export default router;