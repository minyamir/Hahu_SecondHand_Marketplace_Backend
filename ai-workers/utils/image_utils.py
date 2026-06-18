import cv2
import numpy as np

def read_image(file):
    data = np.frombuffer(file, np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)