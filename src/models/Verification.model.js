import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true 
    },
    
    // --- The 3 Essential Uploads ---
    idImageFront: { type: String, required: true },
    idImageBack: { type: String, required: true },
    livenessVideoPath: { type: String, required: true },

    // --- AI Audit Results (Condensed) ---
    fcnNumber: { type: String, index: true ,
        sparse: true // This prevents the 'duplicate null' error
    }, // Extracted by Gemini
    trustScore: { type: Number },             // From FastAPI/InsightFace
    aiReason: { type: String },               // Combined reasoning
    
    // --- Status ---
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'flagged'], 
        default: 'pending' 
    },
    lastAttemptAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);
export default Verification;