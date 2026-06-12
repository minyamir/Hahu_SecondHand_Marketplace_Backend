import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def analyze_image(image):
    prompt = "Check if this ID image looks fake or manipulated. Return risk score 0 to 1."

    response = model.generate_content([prompt, image.file.read()])

    try:
        return float(response.text.strip())
    except:
        return 0.2