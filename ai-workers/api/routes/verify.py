from fastapi import APIRouter, UploadFile, File
from services.verify_service import verify_user

router = APIRouter()

@router.post("/verify")
async def verify(
    id_image: UploadFile = File(...),
    video: UploadFile = File(...)
):
    result = await verify_user(id_image, video)
    return result