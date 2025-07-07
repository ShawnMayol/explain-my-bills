from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import bills, test
from upload_signature import router as upload_router
from delete_cloudinary import router as delete_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(delete_router)
app.include_router(bills.router)
app.include_router(test.router)

@app.get("/")
async def root():
    return {"message": "Hello User!, I will explain your bills!!!"}
