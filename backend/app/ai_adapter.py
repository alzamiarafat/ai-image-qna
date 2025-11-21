import os
import google.generativeai as genai
from fastapi.concurrency import run_in_threadpool

API_KEY = os.getenv("GOOGLE_API_KEY")
print("DEBUG: GOOGLE_API_KEY =", API_KEY)

if not API_KEY:
    raise Exception("GOOGLE_API_KEY is missing! Set it in docker-compose.yml")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


async def ask_ai(detections, question):
    # Handle no detections gracefully
    if not detections:
        description = "No objects detected in the image."
    else:
        description = "\n".join(
            f"- {d['class']} (confidence {d['confidence']:.2f})"
            for d in detections
        )

    prompt = f"""
        You are an AI assistant analyzing image detection results.

        Image contains:
        {description}

        User question:
        {question}

        Provide a helpful and concise answer.
        """

    # Gemini is synchronous, so use threadpool
    def call_gemini():
        return model.generate_content(prompt)

    response = await run_in_threadpool(call_gemini)

    return response
