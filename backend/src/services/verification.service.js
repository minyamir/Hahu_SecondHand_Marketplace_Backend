import Verification from '../models/Verification.model.js';
import User from '../models/User.model.js';
import { performDeepAudit } from '../ai/nationalIdDetection.js';
import { compare } from './faceMatch.service.js'; // The client that calls FastAPI
import fs from 'fs';
import { createNotification } from "./notification.service.js";

export const verifyIdentity = async (userId, files) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User context not found.");

    // 1. FASTAPI BIOMETRIC CHECK (The Specialist)
    // We send only the ID and Video files for high-precision face matching
    const bio = await compare(files.idFront[0].path, files.livenessVideo[0].path);
    
 if (!bio.match) {
    // እዚህ ጋር ነው ማሳወቂያውን መላክ ያለብዎት!
    await createNotification({
        userId,
        title: "❌ Verification Failed",
       message: "Your verification could not be approved. Biometric mismatch detected.",
        type: "verification_rejected"
    });

    cleanupAllFiles(files);
    throw new Error(`Security Rejection: Biometric mismatch. Score: ${bio.similarity.toFixed(2)}`);
}

    // 2. GEMINI FORENSIC AUDIT (The Brain)
    // Pass the files to Gemini for Name/FCN extraction and Fraud checking
    const audit = await performDeepAudit(files, user.fullName);

    // 3. DUPLICATE FCN LOCK
    const fcn = audit.fcnNumber || "UNKNOWN";
    const duplicateId = await Verification.findOne({ fcnNumber: fcn });
    if (duplicateId && duplicateId.userId.toString() !== userId) {
        cleanupAllFiles(files);
        throw new Error("Security Alert: This National ID is already registered.");
    }

// --- 4. DATA MAPPING & STATUS DETERMINATION ---
// const trustScore = bio.similarity * 100;

// // ADD THIS DEBUGGING BLOCK
// console.log("--- DEBUG AUDIT ---");
// console.log("Name Match (Gemini):", audit.nameMatches);
// console.log("Fraud Flag (Gemini Decision):", audit.decision);
// console.log("Reason Provided:", audit.reason);
// console.log("-------------------");

// const isNameMatch = audit.nameMatches === true; 
// const isFraudFlagged = audit.decision === "FLAG";

// const finalStatus = (isNameMatch && !isFraudFlagged) ? 'approved' : 'flagged';

// --- 4. DATA MAPPING & STATUS DETERMINATION ---
const trustScore = bio.similarity * 100;
const matchScore = audit.nameMatchScore || 0;
// INSERT THE DEBUG LOG HERE
console.log("DEBUG: Decision Details ->", {
    matchScore,
    bioValid: bio.match,
    decision: audit.decision,
    reason: audit.reason
});
// SAFE CHECK: Use optional chaining (?.) and a fallback empty string
const reason = (audit.reason || "").toLowerCase(); 

const isBiometricValid = bio.match === true;
const isNameValid = matchScore >= 85;

// Check if the AI flag is for something critical
const isCriticalFraud = audit.decision === "FLAG" && 
                        (reason.includes('tamper') || 
                         reason.includes('forgery'));

const finalStatus = (isBiometricValid && isNameValid && !isCriticalFraud) ? 'approved' : 'flagged';
    // 5. UPDATE OR CREATE RECORD
    const record = await Verification.findOneAndUpdate(
        { userId },
        {
            fcnNumber: fcn,
            idImageFront: files.idFront[0].path, 
            idImageBack: files.idBack[0].path,
            livenessVideoPath: files.livenessVideo[0].path,
            blinkDetected: bio.liveness,
            trustScore: trustScore,
            aiReason: audit.reason,
            status: finalStatus
        },
       { upsert: true, returnDocument: 'after' }
    );
        //     await createNotification({
        //     userId,
        //     title: "🪪 Verification Submitted",
        //     message: "Your identity verification has been submitted and is under review.",
        //     type: "verification_submitted"
        // }); this is በእርስዎ React/Next.js/Mobile ኮድ ውስጥ፣ ፋይሉን ከመላክዎ በፊት setLoading(true) እና "Verification Submitted" የሚል ማሳወቂያ ያሳዩ።
    // 6. UNLOCK USER
        if (finalStatus === "approved") {

            await User.findByIdAndUpdate(userId, {
                isVerified: true,
                verificationRecord: record._id
            });

            await createNotification({
                userId,
                title: "✅ Verification Approved",
                message: "Congratulations! Your identity has been verified successfully.",
                type: "verification_approved"
            });

        }
             // Current logic:
                    if (finalStatus === "false" || finalStatus === "flagged") {
                        await createNotification({
                            userId,
                            title: "❌ Verification Failed", // Or "Verification Flagged"
                            message: audit.reason || "Your verification could not be approved.",
                            type: "verification_rejected" // Use this to trigger the frontend reject-UI
                        });
                    }
    // 7. CLEANUP SENSITIVE FILES
    // (Note: Keep the video until the process is fully done)
    cleanupAllFiles(files); 

    return { 
        success: finalStatus === 'approved', 
        status: finalStatus,
        score: trustScore,
        message: finalStatus === 'flagged' ? "Reviewing" : "Verification successful!"
    };
};

const cleanupAllFiles = (files) => {
    Object.keys(files).forEach(key => {
        files[key].forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
    });
};