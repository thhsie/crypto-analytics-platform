import httpx
from datetime import datetime, timedelta
from app.db.models import PriceData

async def backfill_historical_data(coin_id: str, vs_currency: str, days: int = 1):
    """
    Fetches historical market chart data from CoinGecko and upserts to DB.
    Used for:
    1. New pair tracking (immediate history).
    2. Filling large gaps if the collector was down.
    """
    print(f"[MarketData] Starting backfill for {coin_id} ({days} days)...")
    
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": vs_currency,
        "days": days
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params=params)
            
            # Rate limit handling (Basic)
            if resp.status_code == 429:
                print(f"[MarketData] Rate limit hit for {coin_id}")
                return

            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"[MarketData] Error fetching history for {coin_id}: {e}")
            return

    prices = data.get('prices', [])
    volumes = data.get('total_volumes', [])

    # Prepare batch insert/upsert
    # Note: In a high-throughput system, we would use bulk_write.
    # For this scale, individual upserts (caught by unique index) are acceptable/safer.
    count = 0
    for i, (ts, price) in enumerate(prices):
        vol = volumes[i][1] if i < len(volumes) else 0
        
        try:
            # Idempotent insert: duplicate timestamp/coin/vs will fail silently due to Unique Index
            await PriceData(
                coin_id=coin_id,
                vs_currency=vs_currency,
                timestamp=int(ts),
                price=float(price),
                volume=float(vol),
                provider="coingecko_history"
            ).insert()
            count += 1
        except Exception:
            # Duplicate key error expected for existing points
            continue

    print(f"[MarketData] Backfill complete for {coin_id}. Inserted {count} points.")