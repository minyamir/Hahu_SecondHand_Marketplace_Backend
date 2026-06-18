import { ROLES } from "../constants/roles.js";

// This middleware assumes you have a previous middleware 
// (e.g., protect/auth) that verifies the JWT and attaches 
// the user object to 'req.user'.

export const isAdmin = (req, res, next) => {
    // 1. Check if user exists (set by previous auth middleware)
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: Please log in." 
        });
    }

    // 2. Check if the role is ADMIN
    if (req.user.role === ROLES.ADMIN) {
        next(); // User is an admin, proceed to the controller
    } else {
        // User is logged in but does not have the correct role
        return res.status(403).json({ 
            success: false, 
            message: "Access Denied: You do not have permission to perform this action." 
        });
    }
};