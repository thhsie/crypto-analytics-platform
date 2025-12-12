import httpx
import asyncio
from datetime import datetime, timedelta
from app.db.models import TrackedPair, PriceData
from app.services.market_data import backfill_historical_data

# Simple Price Fetcher (For small updates)
async def fetch_latest_price(coin_id: str, vs: str):
    url = "https://api.coingecko.com/api/v3/simple/price"
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            url, 
            params={"ids": coin_id, "vs_currencies": vs, "include_24hr_vol": "true"}
        )
        resp.raise_for_status()
        return resp.json()

async def process_pair(coin_id: str, vs_currency: str):
    """
    Decides whether to fetch latest price OR backfill history based on DB state.
    """
    # 1. Check last data point in DB
    last_point = await PriceData.find(
        PriceData.coin_id == coin_id,
        PriceData.vs_currency == vs_currency
    ).sort("-timestamp").limit(1).to_list()

    now = datetime.utcnow()
    
    # Case A: No data at all -> Backfill 7 days
    if not last_point:
        await backfill_historical_data(coin_id, vs_currency, days=7)
        return

    # Case B: Data exists, calculate gap
    last_ts_ms = last_point[0].timestamp
    last_date = datetime.fromtimestamp(last_ts_ms / 1000.0)
    gap = now - last_date

    # Case C: Gap > 15 minutes (App was likely down) -> Backfill 1 day to bridge gap
    if gap > timedelta(minutes=15):
        print(f"[Collector] Gap detected ({gap}) for {coin_id}. Triggering smart fill.")
        await backfill_historical_data(coin_id, vs_currency, days=1)
        return

    # Case D: Normal operation (Gap is small) -> Fetch latest only
    try:
        data = await fetch_latest_price(coin_id, vs_currency)
        if coin_id in data:
            entry = data[coin_id]
            price = entry[vs_currency]
            vol_key = f"{vs_currency}_24h_vol"
            vol = entry.get(vol_key, 0)
            
            await PriceData(
                coin_id=coin_id,
                vs_currency=vs_currency,
                timestamp=int(now.timestamp() * 1000),
                price=price,
                volume=vol,
                provider="coingecko_live"
            ).insert()
    except Exception as e:
        print(f"[Collector] Error updating {coin_id}: {e}")

async def run_collector_cycle():
    """
    Runs one cycle of data collection for ALL distinct active pairs.
    """
    # Get all active pairs
    pairs = await TrackedPair.find(TrackedPair.status == "active").to_list()
    
    # Extract unique (coin_id, vs_currency) tuples to avoid duplicate requests
    # (e.g., 10 users tracking Bitcoin -> 1 request)
    unique_targets = {(p.coin_id, p.vs_currency) for p in pairs}
    
    print(f"[Collector] Cycle start. Processing {len(unique_targets)} unique assets.")
    
    for coin_id, vs in unique_targets:
        await process_pair(coin_id, vs)
        # Sleep slightly between requests to be nice to the API
        await asyncio.sleep(1)