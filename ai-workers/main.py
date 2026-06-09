from fastapi import FastAPI
from api.routes.verify import router

app = FastAPI(title="AI Worker - KYC System")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "AI Worker Running"}