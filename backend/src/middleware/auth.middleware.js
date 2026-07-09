import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.model.js"; // 1. Import your Model

export const authMiddleware = async (req, res, next) => { // 2. Make it async
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    // 3. Fetch the LATEST data from the database
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    // 4. Attach the real DB object, not just the token data
    req.user = freshUser; 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token"
    });
  }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
};
// Add this line at the very bottom of your auth.middleware.js file:
export default authMiddleware;
export { authMiddleware as protect };
