from deepface import DeepFace

import tempfile

def compare_faces(img1, img2):
    # save temp files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f1:
        f1.write(img1.file.read())
        path1 = f1.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f2:
        f2.write(img2.file.read())
        path2 = f2.name

    result = DeepFace.verify(path1, path2)

    return {
        "match": result["verified"],
        "score": round((1 - result["distance"]) * 100, 2)
    }