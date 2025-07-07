from fastapi import APIRouter, Request
from dotenv import load_dotenv
import cloudinary
import cloudinary.utils
import os, time

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
