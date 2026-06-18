import insightface
import numpy as np

model = insightface.app.FaceAnalysis()
model.prepare(ctx_id=0, det_size=(640, 640))

def get_face_embedding(img):
    faces = model.get(img)
    if not faces:
        return None
    return faces[0].embedding