from fastapi import APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from google.genai.types import Part
from google import genai

import os

router = APIRouter(
    prefix="/test",
    responses={404: {"description": "Not found"}},
)

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=gemini_api_key)

@router.post("/test_prompt")
async def test_img_text_prompt(prompt_txt: str, prompt_img: UploadFile = File(...)):
    try:
        
        # insert custom prompt for bill reading and obtaining the summarized data in a JSON format
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                Part.from_bytes(
                    data=prompt_img.file.read(), 
                    mime_type="image/jpeg"
                ),
                prompt_txt
            ]
        )

        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {e}")