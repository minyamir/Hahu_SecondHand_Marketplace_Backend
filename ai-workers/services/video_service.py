from core.face_engine import get_face_embedding
from utils.video_utils import extract_frames
import tempfile

async def process_video(file):
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    temp.write(await file.read())
    temp.close()

    frames = extract_frames(temp.name)

    embeddings = []
    for f in frames:
        emb = get_face_embedding(f)
        if emb is not None:
            embeddings.append(emb)

    return embeddings, frames