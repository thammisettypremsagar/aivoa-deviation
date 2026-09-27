from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.deviations import router as deviation_router


app = FastAPI(
    title="AIVOA Deviation Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AIVOA Deviation Management API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(deviation_router)