import pytesseract
import cv2
import numpy as np


# If Windows, uncomment and set path:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def read_text(image_bytes: bytes) -> str:
    """
    Extract text from image using Tesseract OCR
    """

    try:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return ""

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # OCR
        text = pytesseract.image_to_string(gray)

        return text.strip()

    except Exception as e:
        return f"OCR error: {str(e)}"