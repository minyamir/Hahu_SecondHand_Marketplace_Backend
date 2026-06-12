import * as verificationService from '../services/verification.service.js';

export const handleVerificationSubmit = async (req, res) => {
    try {
        // 1. Check if files exist
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No verification files were uploaded." 
            });
        }

        // 2. Updated Required Fields (Matching your new routes)
        const requiredFields = [
            'idFront', 
            'idBack', 
            'livenessVideo'
        ];

        // 3. Validation: Ensure all 3 files are present
        for (const field of requiredFields) {
            if (!req.files[field] || !req.files[field][0]) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Missing required upload: ${field}. Please provide ID front, back, and liveness video.` 
                });
            }
        }

        // 4. Pass the files to the service
        const result = await verificationService.verifyIdentity(
            req.user.id, 
            req.files 
        );

        // 5. Success Response
        res.status(200).json({ 
            success: result.success, 
            status: result.status,
            message: result.message 
        });

    } catch (error) {
        console.error("Verification Controller Error:", error.message);
        
        const statusCode = error.message.includes("Security") ? 403 : 500;
        res.status(statusCode).json({ 
            success: false, 
            message: error.message || "An error occurred during identity processing." 
        });
    }
};