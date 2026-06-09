import { DeepFace } from 'deepface';

export const verify = async (img1, img2) => {
    const result = await DeepFace.verify({ img1_path: img1, img2_path: img2 });
    return result.distance; // Returns numerical distance (lower is better)
};