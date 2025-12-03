from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.db.models import User, TrackedPair, PriceData
from app.services.collector import run_collector_cycle
from app.api.routes import router
import asyncio
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Crypto Analytics API")

# CORS (Allowed for FE dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def app_startup():
    # DB Init
    client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    await init_beanie(database=client.crypto_analytics, document_models=[User, TrackedPair, PriceData])
    
    # Background Task (PDF Page 3)
    asyncio.create_task(background_worker())

async def background_worker():
    while True:
        # Run every 5 minutes (300 seconds)
        print("Running background collection cycle...")
        await run_collector_cycle()
        await asyncio.sleep(300)