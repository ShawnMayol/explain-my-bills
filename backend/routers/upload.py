from fastapi import APIRouter, HTTPException, Request
from dotenv import load_dotenv
import cloudinary
import cloudinary.utils
import os
import time

load_dotenv()
router = APIRouter()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

@router.post("/upload-signature")
async def get_upload_signature(request: Request):
    data = await request.json()
    user_id = data.get("userId")
    filename = data.get("filename")

    if not user_id or not filename:
        raise HTTPException(status_code=400, detail="Missing userId or filename")

    timestamp = int(time.time())
    folder = f"bills/{user_id}"
    public_id = filename

    signature = cloudinary.utils.api_sign_request(
        {
            "timestamp": timestamp,
            "folder": folder,
            "public_id": public_id
        },
        os.getenv("API_SECRET")
    )

    return {
        "cloudName": os.getenv("CLOUD_NAME"),
        "apiKey": os.getenv("API_KEY"),
        "timestamp": timestamp,
        "folder": folder,
        "signature": signature,
        "publicId": public_id
    }
