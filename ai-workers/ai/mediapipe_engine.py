import cv2
import mediapipe as mp


mp_face_mesh = mp.solutions.face_mesh


def detect_face_landmarks(frame):
    """
    Detect face landmarks using MediaPipe FaceMesh.

    Returns:
        list of landmarks or None
    """

    try:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        ) as face_mesh:

            results = face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                return None

            landmarks = []

            face_landmarks = results.multi_face_landmarks[0]

            for lm in face_landmarks.landmark:
                landmarks.append({
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z
                })

            return landmarks

    except Exception as e:
        print("MediaPipe error:", e)
        return None