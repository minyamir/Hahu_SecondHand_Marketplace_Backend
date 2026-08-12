import express from 'express';
import { createListing,
    getVerifiedListings ,
    getListingById,
    updateListing,
    deleteListing,
    getMyListings,
    toggleSoldStatus,
    toggleLike,
    getAllListings,
    incrementViews} from '../controllers/listings.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { verifiedMiddleware } from '../middleware/verified.middleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

/**
 * @route   POST /api/listings/upload
 * @desc    Only a logged-in AND verified user can post a product
 */
router.get('/verified', getVerifiedListings);
router.get('/my-listings', authMiddleware, getMyListings);
router.get('/', getAllListings);// New route for all listings with filters
router.get('/:id', getListingById);

router.post(
    '/upload', 
    authMiddleware,      // 1. Are they logged in?
    verifiedMiddleware,  // 2. Have they passed the ID audit?
    upload.array('images', 5), // 3. Handle up to 5 product photos
    createListing        // 4. Finally save to DB
);


router.put('/:id', authMiddleware, updateListing);
router.delete('/:id', authMiddleware, deleteListing);
//  existing imports
router.patch('/:id/view', incrementViews);
router.patch('/:id/like', authMiddleware, toggleLike);
router.patch('/:id/sold', authMiddleware, toggleSoldStatus);
export default router;
