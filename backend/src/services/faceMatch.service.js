import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * Sends files to the Python FastAPI worker for biometric verification.
 * @param {string} idImagePath - Absolute path to the front ID image.
 * @param {string} videoPath - Absolute path to the liveness video.
 */
export const compare = async (idImagePath, videoPath) => {
    const form = new FormData();
    form.append('id_image', fs.createReadStream(path.resolve(idImagePath)));
    form.append('video', fs.createReadStream(path.resolve(videoPath)));

    try {
        const response = await axios.post('http://127.0.0.1:8000/verify', form, {
            headers: { ...form.getHeaders() },
            timeout: 90000 
        });
        console.log("Worker response:", response.data);
        return response.data;
    } catch (error) {
        // THIS IS THE KEY: We need to see exactly what axios thinks is wrong
        if (error.response) {
            console.error("Worker responded with error:", error.response.status, error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error("Request timed out (Python is too slow)");
        } else {
            console.error("Request setup error:", error.message);
        }
        throw error; // Re-throw to see the full stack trace
    }
};