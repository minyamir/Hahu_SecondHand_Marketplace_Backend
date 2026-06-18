import Tesseract from 'tesseract.js';

export const extractFCN = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng', // Ethiopian IDs usually use Latin characters for the FCN
            { logger: m => console.log(m) } // Optional: monitor progress
        );

        // Regex for your specific FCN format. 
        // Example: If your FCN is 10 alphanumeric characters, use /[A-Z0-9]{10}/
        // Adjust the length {10} to match your specific requirement
        const fcnPattern = /[A-Z0-9]{10,12}/; 
        const match = text.match(fcnPattern);

        return match ? match[0] : null; 
    } catch (error) {
        console.error("OCR Extraction Error:", error);
        return null;
    }
};