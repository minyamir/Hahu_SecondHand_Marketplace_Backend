import cv2

def simple_liveness_check(frames):
    # basic motion detection (NOT spoof-proof but OK for MVP)
    if len(frames) < 5:
        return False

    diff = 0
    for i in range(1, len(frames)):
        diff += cv2.absdiff(frames[i], frames[i-1]).mean()

    return diff > 10  # threshold