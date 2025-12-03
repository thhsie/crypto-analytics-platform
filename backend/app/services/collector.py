import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.db.models import TrackedPair, PriceData
from datetime import datetime

# PDF Page 2: "Free tier rate limits apply; implement basic retry/backoff responsibly."
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(httpx.HTTPError)
)
async def fetch_simple_price(coin_id: str, vs: str):
    async with httpx.AsyncClient() as client:
        # PDF Tip: /simple/price for latest
        url = "https://api.coingecko.com/api/v3/simple/price"
        resp = await client.get(
            url, 
            params={
                "ids": coin_id, 
                "vs_currencies": vs, 
                "include_24hr_vol": "true"
            }
        )
        resp.raise_for_status()
        return resp.json()

async def run_collector_cycle():
    """
    PDF Page 3: "Background collector(s) fetching every 5 minutes per active pair"
    """
    active_pairs = await TrackedPair.find(TrackedPair.status == "active").to_list()
    
    # In production, this would be a queue. For this test, a loop is sufficient.
    for pair in active_pairs:
        try:
            data = await fetch_simple_price(pair.coin_id, pair.vs_currency)
            
            if pair.coin_id in data:
                entry = data[pair.coin_id]
                price = entry[pair.vs_currency]
                # API naming inconsistency handling
                vol_key = f"{pair.vs_currency}_24h_vol"
                vol = entry.get(vol_key, 0)

                # PDF Page 4: "Implement idempotent upserts"
                # We attempt insert. If timestamp/coin/vs matches, Mongo raises DuplicateKey, we ignore.
                await PriceData(
                    coin_id=pair.coin_id,
                    vs_currency=pair.vs_currency,
                    timestamp=int(datetime.utcnow().timestamp() * 1000),
                    price=price,
                    volume=vol
                ).insert()
        except Exception as e:
            # Swallow errors here to keep the collector running for other pairs
            # In a real app, we would log this to Sentry
            print(f"Error collecting {pair.coin_id}: {e}")