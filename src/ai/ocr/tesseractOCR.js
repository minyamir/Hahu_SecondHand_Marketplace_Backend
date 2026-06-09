import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export const performOCR = async (imagePath) => {
    const processed = await sharp(imagePath).grayscale().contrast(2).toBuffer();
    const { data: { text } } = await Tesseract.recognize(processed, 'eng');
    return text;
};