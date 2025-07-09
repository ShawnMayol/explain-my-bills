from fastapi import APIRouter, HTTPException, Request
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

@router.delete("/delete-cloudinary")
async def delete_image(request: Request):
    data = await request.json()
    public_id = data.get("publicId")
    if not public_id:
        raise HTTPException(status_code=400, detail="Missing publicId")

    try:
        result = cloudinary.uploader.destroy(public_id)
        if result.get("result") != "ok":
            raise HTTPException(status_code=500, detail="Failed to delete image")
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
