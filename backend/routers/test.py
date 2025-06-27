from fastapi import APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
import google.generativeai as genai
import os

router = APIRouter(
    prefix="/test",
    responses={404: {"description": "Not found"}},
)

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)
model_name = "gemini-2.5-flash"

@router.post("/test_prompt")
async def test_img_text_prompt(prompt_txt: str, prompt_img: UploadFile = File(...)):
    try:
        img_bytes = await prompt_img.read()

        # Compose the multi-modal prompt as per new SDK format
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt_txt},
                        {
                            "inline_data": {
                                "mime_type": prompt_img.content_type or "image/png",
                                "data": img_bytes,
                            }
                        }
                    ]
                }
            ]
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")
