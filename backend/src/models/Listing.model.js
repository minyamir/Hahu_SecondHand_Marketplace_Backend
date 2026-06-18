import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, 
    images: [{ type: String }], 
    location: { type: String, default: "Bahir Dar" },
    condition: { type: String, enum: ['new', 'slightly used', 'used'], default: 'used' },
    
    // --- NEW: AI & Security Fields ---
    isAiApproved: { type: Boolean, default: false }, // Moderation flag
    aiSafetyReason: { type: String }, // Why it was flagged or approved
    imageHash: { type: String, index: true }, // To detect duplicate scam photos
    // Add this to your schema in Listing.model.js
     likes: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
],
    // --- For the Ranking Algorithm ---
    likesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isSold: { type: Boolean, default: false },
    rankingScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexing for the Ranking Algorithm (Fast search)
listingSchema.index({ rankingScore: -1, createdAt: -1 });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;