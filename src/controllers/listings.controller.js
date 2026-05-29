import Listing from '../models/Listing.model.js';
import { CATEGORIES } from '../constants/categories.js';

export const createListing = async (req, res) => {
    try {
        const { title, description, price, category, condition, location } = req.body;
        const sellerId = req.user.id;

        // 1. Validation: Is the category allowed?
        if (!CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Please select from: ${CATEGORIES.join(', ')}`
            });
        }

        // 2. Validation: Ensure images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one product image."
            });
        }

        // 3. Extract image paths
        const imagePaths = req.files.map(file => file.path);
        
        const startingScore = req.user.isVerified ? 100 : 0;
        // 4. Create the Listing (Defaulting AI fields to true for now)
        const newListing = new Listing({
            seller: sellerId,
            title,
            description,
            price,
            category,
            condition,
            location,
            images: imagePaths,
            isAiApproved: true, // Auto-approve for now
            aiSafetyReason: "Manually skipped for development testing.",
            rankingScore: startingScore // Use the calculated starting score
        });

        await newListing.save();

        res.status(201).json({
            success: true,
            message: "Listing posted successfully!",
            data: newListing
        });

    } catch (error) {
        console.error("Create Listing Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create listing. Please try again."
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
            .populate('seller', 'fullName isVerified profileImage')
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

export const getMyListings = async (req, res) => {
    try {
        // Find all listings where the seller matches the ID from the token
        const listings = await Listing.find({ seller: req.user.id })
            .sort({ createdAt: -1 });

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

export const toggleLike=async(req,res)=>{
    try{
        const { id } = req.params;
        const userId = req.user.id;
        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        const isLiked = listing.likes.includes(userId);

        if (isLiked) {
            // UNLIKE: Remove user ID and decrease ranking
            listing.likes = listing.likes.filter(uid => uid.toString() !== userId);
            listing.likesCount = Math.max(0, listing.likesCount - 1);
            listing.rankingScore -= 10; 
        } else {
            // LIKE: Add user ID and boost ranking
            listing.likes.push(userId);
            listing.likesCount += 1;
            listing.rankingScore += 10;
        }

        await listing.save();

        res.status(200).json({ 
            success: true, 
            liked: !isLiked, 
            likesCount: listing.likesCount 
        });
    }
    catch(error){
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
                    rankingScore: 0.5 // Small, fair increase for everyone
                } 
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            views: listing.views,
            newRanking: listing.rankingScore
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};