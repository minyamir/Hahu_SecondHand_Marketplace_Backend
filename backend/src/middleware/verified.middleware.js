/**
 * Verified Middleware
 * Ensures that the user has passed the "Iron Gate" National ID audit
 * before allowing access to specific marketplace actions.
 */

export const verifiedMiddleware = async (req, res, next) => {
    try {
        // 1. Check if user object exists (populated by authMiddleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No user context found."
            });
        }

        // 2. Check the verification status
        // We check 'isVerified' which is updated after the AI forensic audit
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                status: "UNVERIFIED",
                message: "Access Denied: This feature is only available for HaHu Verified members. Please complete your National ID verification in your profile."
            });
        }

        // 3. User is verified, proceed to the controller
        next();

    } catch (error) {
        console.error("Verified Middleware Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error during verification check."
        });
    }
};
// Add this line at the very bottom of your verified.middleware.js file:
export default verifiedMiddleware;
export { verifiedMiddleware as isVerified };