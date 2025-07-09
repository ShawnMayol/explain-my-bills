from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import bills, test, upload, delete

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(delete.router)
app.include_router(bills.router)
app.include_router(test.router)

@app.get("/")
async def root():
    return {"message": "Hello User!, I will explain your bills!!!"}
