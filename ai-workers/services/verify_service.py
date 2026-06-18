from services.id_service import process_id_image
from services.video_service import process_video
from core.matcher import cosine_similarity
from core.liveness import simple_liveness_check
from config import FACE_MATCH_THRESHOLD

async def verify_user(id_image, video):

    id_emb = await process_id_image(id_image)

    if id_emb is None:
        return {"match": False, "reason": "No face in ID"}

    video_embs, frames = await process_video(video)

    if not video_embs:
        return {"match": False, "reason": "No face in video"}

    # average video embedding
    import numpy as np
    video_emb = np.mean(video_embs, axis=0)

    similarity = cosine_similarity(id_emb, video_emb)

    liveness = simple_liveness_check(frames)

    return {
    "match": bool(similarity > FACE_MATCH_THRESHOLD),
    "similarity": float(similarity),
    "liveness": bool(liveness)
     }