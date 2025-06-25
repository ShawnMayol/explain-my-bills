from fastapi import FastAPI, File, UploadFile, HTTPException
from .routers import bills, test

app = FastAPI()

app.include_router(bills.router)
app.include_router(test.router)

@app.get("/")
async def root():
    return {"message": "Hello User!, I will explain your bills!!!"}