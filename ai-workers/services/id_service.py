from core.face_engine import get_face_embedding
from utils.image_utils import read_image

async def process_id_image(file):
    img_bytes = await file.read()
    img = read_image(img_bytes)

    emb = get_face_embedding(img)
    return emb