from fastapi import FastAPI
from contextlib import asynccontextmanager
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

# Global reference to the worker task so we can cancel it on shutdown
background_task_ref = None

async def background_worker():
    """
    Continuous loop that triggers the collector every 5 minutes.
    """
    print("[System] Background worker started.")
    try:
        while True:
            # Run collector
            await run_collector_cycle()
            # Wait 5 minutes
            await asyncio.sleep(300)
    except asyncio.CancelledError:
        print("[System] Background worker cancelling...")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    # 1. Initialize DB
    client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    await init_beanie(database=client.crypto_analytics, document_models=[User, TrackedPair, PriceData])
    print("[System] DB Connected.")

    # 2. Start Background Worker
    # We store the task reference to prevent garbage collection and allow cancellation
    global background_task_ref
    background_task_ref = asyncio.create_task(background_worker())

    yield # App is running and serving requests

    # --- SHUTDOWN ---
    # 3. Graceful Cleanup
    if background_task_ref:
        background_task_ref.cancel()
        try:
            await background_task_ref
        except asyncio.CancelledError:
            print("[System] Background worker shutdown complete.")

app = FastAPI(title="Crypto Analytics API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")