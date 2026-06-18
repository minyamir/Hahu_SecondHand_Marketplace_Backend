import User from "../models/User.model.js";
import Verification from "../models/Verification.model.js";

/**
 * 1. Get all users who are currently in 'pending' status.
 * Used for the Admin Dashboard list view.
 */
export const getPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.find({ verificationStatus: 'pending' });
        res.status(200).json({ success: true, count: pendingUsers.length, data: pendingUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. Get full details of a specific user's attempt.
 * Used when an admin clicks on a user to view their ID images and AI audit results.
 */
export const getVerificationDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const details = await Verification.findOne({ userId });
        
        if (!details) {
            return res.status(404).json({ success: false, message: "Verification record not found." });
        }
        
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 3. Process Verification (Approve or Reject).
 * This updates both the Verification audit log and the User's core account status.
 */
export const processVerification = async (req, res) => {
    try {
        const { userId, status, adminComment } = req.body; 

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status provided." });
        }

        // A. Update User core state
        await User.findByIdAndUpdate(userId, {
            isVerified: status === 'approved',
            verificationStatus: status === 'approved' ? 'verified' : 'rejected'
        });

        // B. Update Verification audit record
        const record = await Verification.findOneAndUpdate(
            { userId },
            { 
                status: status,
                adminComment: adminComment,
                reviewedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({ 
            success: true, 
            message: `User verification has been ${status}.`,
            data: record 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};