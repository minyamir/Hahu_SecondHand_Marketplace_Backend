import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirs = ['uploads/nationalIds', 'uploads/faces', 'uploads/temp'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname.startsWith('id')) {
            cb(null, 'uploads/nationalIds'); // Front & Back IDs
        } else if (file.fieldname.startsWith('face')) {
            cb(null, 'uploads/faces'); // Front, Left, Right images
        } else if (file.fieldname === 'livenessVideo') {
            cb(null, 'uploads/temp'); // 5-second video
        } else {
            cb(null, 'uploads/misc');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const isPhoto = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase());
    const isVideo = /mp4|mov|webm/.test(path.extname(file.originalname).toLowerCase());

    if (file.fieldname === 'livenessVideo') {
        return isVideo ? cb(null, true) : cb(new Error('Video required for livenessVideo'));
    }
    // All other fields are photos
    return isPhoto ? cb(null, true) : cb(new Error(`Image required for ${file.fieldname}`));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 60 * 1024 * 1024 }, // Slightly increased for 6 files
    fileFilter: fileFilter
});

export default upload;