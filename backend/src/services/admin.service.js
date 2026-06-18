import mongoose from "mongoose";
import User from "../models/userModel.js";
import Verification from "../models/verificationModel.js";
import { sendVerificationEmail } from "../utils/emailService.js";

export const fetchPendingUsers = async () => {
    return await User.find({ verificationStatus: 'pending' }).lean();
};

export const fetchVerificationData = async (userId) => {
    const details = await Verification.findOne({ userId }).lean();
    if (!details) throw new Error("Verification record not found.");
    return details;
};

export const handleVerificationProcess = async (userId, status, adminComment, adminId) => {
    // Start a transaction to ensure database consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Update User core state
        const user = await User.findByIdAndUpdate(
            userId, 
            { 
                isVerified: status === 'approved',
                verificationStatus: status === 'approved' ? 'verified' : status 
            },
            { new: true, session }
        );

        // 2. Update Verification audit record
        const record = await Verification.findOneAndUpdate(
            { userId },
            { 
                status: status,
                adminComment: adminComment,
                reviewedBy: adminId,
                reviewedAt: new Date()
            },
            { new: true, session }
        );

        await session.commitTransaction();

        // 3. Trigger Email Notification (outside the transaction)
        if (status === 'approved') {
            await sendVerificationEmail(user.email, "Verification Success!", "Congratulations! Your account is now verified.");
        } else if (status === 'rejected') {
            await sendVerificationEmail(user.email, "Verification Update", `Your verification status has been updated to: ${status}. Comment: ${adminComment}`);
        }

        return { user, record };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};