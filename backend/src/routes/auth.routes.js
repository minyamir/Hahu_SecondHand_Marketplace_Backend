import { Router } from "express";
import { login, me, register, updateAvatar } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js"; // Adjust the path to your multer upload middleware

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

// --- NEW: Avatar Update Route ---
router.put("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);

export default router;