import asyncio
import os
import sys
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from typing import List

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.models import PriceData, TrackedPair, User

load_dotenv()

async def backfill_history(coin_id: str, vs_currency: str, days: int):
    """
    Requirements: PDF Page 3 "Backfill historical data for a pair and window"
    """
    print(f"--- Starting Backfill: {coin_id} vs {vs_currency} for {days} days ---")

    # 1. Initialize DB Connection (Standalone script needs its own init)
    client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    await init_beanie(database=client.crypto_analytics, document_models=[PriceData, TrackedPair, User])

    # 2. Fetch Historical Data from CoinGecko
    async with httpx.AsyncClient() as client:
        # Endpoint: /coins/{id}/market_chart
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        try:
            print("Fetching from CoinGecko...")
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError as e:
            print(f"API Error: {e}")
            return

    # 3. Process Data
    prices = data.get('prices', [])
    volumes = data.get('total_volumes', [])
    
    print(f"Received {len(prices)} data points. Inserting...")

    inserted_count = 0
    for i, (ts, price) in enumerate(prices):
        # Match volume by index (CoinGecko usually aligns them)
        vol = volumes[i][1] if i < len(volumes) else 0
        
        # Upsert
        try:
            await PriceData(
                coin_id=coin_id,
                vs_currency=vs_currency,
                timestamp=int(ts), # CoinGecko sends ms
                price=float(price),
                volume=float(vol),
                provider="backfill_script"
            ).insert()
            inserted_count += 1
        except Exception:
            # Ignore duplicates
            pass

    print(f"--- Success. Inserted {inserted_count} records. ---")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/backfill.py <coin_id> <days>")
        # Example default run
        asyncio.run(backfill_history("bitcoin", "usd", 7))
    else:
        asyncio.run(backfill_history(sys.argv[1], "usd", int(sys.argv[2])))