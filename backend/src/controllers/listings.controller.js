import Listing from '../models/Listing.model.js';
import { CATEGORIES } from '../constants/categories.js';
import { createNotification } from "../services/notification.service.js";
import { io } from '../sockets/socketServer.js'; // Import your initialized io instance

export const createListing = async (req, res) => {
    try {
        const { title, description, price, category, condition, location } = req.body;
        
        // Safe sellerId extraction
        const sellerId = req.user?.id || req.user?._id;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User ID not found."
            });
        }

        // 1. Validation: Is the category allowed?
        if (!CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Please select from: ${CATEGORIES.join(', ')}`
            });
        }

        // 2. Validation: Ensure images were uploaded via Multer
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one product image."
            });
        }

        // 3. Extract image paths safely
        const imagePaths = req.files.map(file => file.path || file.secure_url || file.filename);

        // 4. Safely handle numerical price conversion
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid number."
            });
        }

        const startingScore = req.user?.isVerified ? 100 : 0;

        // 5. Create the Listing
        const newListing = new Listing({
            seller: sellerId,
            title,
            description,
            price: numericPrice, // 🟢 Converted string to Float
            category,
            condition,
            location,
            images: imagePaths,
            isAiApproved: true,
            aiSafetyReason: "Manually skipped for development testing.",
            rankingScore: startingScore
        });

        await newListing.save();

        // 6. Notify the seller (Wrapped in try/catch to prevent notification failure from killing the response)
        try {
            await createNotification({
                userId: sellerId,
                title: "🚀 Listing Live!",
                message: `Your item "${title}" has been posted successfully.`,
                type: "listing_created"
            });
        } catch (notifErr) {
            console.error("Notification creation failed:", notifErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Listing posted successfully!",
            data: newListing
        });

    } catch (error) {
        // 🟢 Detailed logging to show exact Mongoose / System errors in terminal
        console.error("Create Listing Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create listing. Please try again."
        });
    }
};

export const getVerifiedListings = async (req, res) => {
    try {
        const listings = await Listing.find({ isSold: false })
            .populate({
                path: 'seller',
                select: 'fullName isVerified',
                match: { isVerified: true } 
            })
            // --- ADDED RANKING SORT HERE ---
            .sort({ rankingScore: -1, createdAt: -1 }); 

        // Still need to filter nulls because .populate 'match' 
        // returns the listing with seller: null if they aren't verified
        const filteredListings = listings.filter(item => item.seller !== null);

        res.status(200).json({
            success: true,
            count: filteredListings.length,
            data: filteredListings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllListings = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let filter = { isSold: false };

        // Handle Category filtering
        if (category) filter.category = category;

        // Handle Search (Title & Description)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Sorting Logic (Default to best Ranking Score)
        let sortQuery = { rankingScore: -1, createdAt: -1 };
        if (sort === 'newest') sortQuery = { createdAt: -1 };
        if (sort === 'price_low') sortQuery = { price: 1 };

        const listings = await Listing.find(filter)
            // 🛠️ ADD ALL POTENTIAL AVATAR FIELD NAMES HERE
            .populate('seller', 'fullName isVerified profileImage profileImageUrl avatar')
            .sort(sortQuery)
            .limit(20);

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getListingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the listing and get seller details (including phone for the buyer)
        const listing = await Listing.findById(id).populate('seller', 'fullName isVerified phone email');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        // Increment view count and update ranking score manually
        listing.views += 1;
        listing.rankingScore += 0.5; // <-- ADD THIS LINE HERE
        await listing.save();

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (error) {
        console.error("Fetch Single Listing Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Invalid Listing ID format"
        });
    }
};
// Update a listing
export const updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        // Security: Check if the person updating is the owner
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own listings" });
        }

        const updatedListing = await Listing.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({ success: true, data: updatedListing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a listing
export const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        // Security check
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Listing.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// controllers/listings.controller.js
export const getMyListings = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        console.log("Currently Authenticated User ID:", userId); // 👈 Log this

        const listings = await Listing.find({ seller: userId }).sort({ createdAt: -1 });
        console.log("Found listings count for user:", listings.length); // 👈 Log this

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const toggleSoldStatus = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        listing.isSold = !listing.isSold; // If true, make false. If false, make true.
        await listing.save();

        res.status(200).json({ 
            success: true, 
            message: listing.isSold ? "Item marked as Sold" : "Item re-listed",
            isSold: listing.isSold 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        const isLiked = listing.likes.includes(userId);

        if (isLiked) {
            listing.likes = listing.likes.filter(uid => uid.toString() !== userId);
            listing.likesCount = Math.max(0, listing.likesCount - 1);
            listing.rankingScore -= 10; 

                 // --- NEW: TRIGGER NOTIFICATION FOR SELLER ---
            if (listing.seller._id.toString() !== userId) {
                await createNotification({
                    userId: listing.seller._id,
                    title: "❤️ New Like!",
                    message: `Someone liked your listing: ${listing.title}`,
                    type: "like_received",
                    listingId: listing._id
                }); }
        } else {
            listing.likes.push(userId);
            listing.likesCount += 1;
            listing.rankingScore += 10;
        }
            
        await listing.save();
             // ADD THIS LOG
console.log(`📡 Broadcasting 'listingUpdated' to room: listing_${id}`);
        // Broadcast the update to everyone in the listing room
        io.to(`listing_${id}`).emit("listingUpdated", {
            listingId: id,
            likesCount: listing.likesCount,
            isLiked: !isLiked
        });

        res.status(200).json({ 
            success: true, 
            liked: !isLiked, 
            likesCount: listing.likesCount 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const incrementViews = async (req, res) => {
    try {
        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { 
                $inc: { 
                    views: 1, 
                    rankingScore: 0.5 
                } 
            },
            { new: true }
        );

        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        // Broadcast the new view count to everyone in the listing room
        io.to(`listing_${req.params.id}`).emit("listingUpdated", {
            listingId: req.params.id,
            views: listing.views
        });

        res.status(200).json({
            success: true,
            views: listing.views,
            newRanking: listing.rankingScore
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};