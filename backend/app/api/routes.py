from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from app.db.models import TrackedPair, PriceData, User
from app.auth import get_current_user
from app.services.market_data import backfill_historical_data
from app.services.queue_manager import add_to_backfill_queue
from pydantic import BaseModel
import httpx
from datetime import datetime, timedelta

router = APIRouter()

COIN_LIST_CACHE = {
    "data": [],
    "expires": datetime.min
}

class PairDTO(BaseModel):
    coin_id: str
    vs_currency: str

@router.get("/pairs")
async def list_pairs(uid: str = Depends(get_current_user)):
    return await TrackedPair.find(TrackedPair.user_id == uid, TrackedPair.status == "active").to_list()

@router.delete("/pairs/{coin}/{vs}")
async def stop_tracking(coin: str, vs: str, uid: str = Depends(get_current_user)):
    pair = await TrackedPair.find_one(TrackedPair.user_id == uid, TrackedPair.coin_id == coin, TrackedPair.vs_currency == vs)
    if pair:
        pair.status = "stopped"
        await pair.save()
    return {"status": "stopped"}

@router.get("/analytics/{coin}/{vs}")
async def get_analytics(
    coin: str, vs: str, 
    from_ts: int = Query(alias="from"), 
    to_ts: int = Query(alias="to"),
    uid: str = Depends(get_current_user)
):
    # Check if we have data covering the requested range (roughly)
    # We check the earliest timestamp in DB for this coin
    earliest_record = await PriceData.find(
        PriceData.coin_id == coin,
        PriceData.vs_currency == vs
    ).sort("+timestamp").limit(1).to_list()
    
    cutoff_time = datetime.fromtimestamp(from_ts / 1000.0)
    
    # If no data OR earliest data is newer than what we asked for (meaning we have a gap in history)
    # We trigger a fetch.
    should_fetch = False
    if not earliest_record:
        should_fetch = True
    else:
        db_earliest = datetime.fromtimestamp(earliest_record[0].timestamp / 1000.0)
        # If DB starts at Dec 5th, but we asked for Dec 1st, we need to fetch history
        if db_earliest > cutoff_time + timedelta(hours=1): 
            should_fetch = True

    if should_fetch:
        # Calculate days needed. 
        # timestamp is ms. (now - from) / 1000 / 3600 / 24
        now_ts = datetime.utcnow().timestamp() * 1000
        days_needed = (now_ts - from_ts) / (1000 * 60 * 60 * 24)
        days_needed = max(1, int(days_needed) + 1) # Round up, min 1 day
        
        # Max cap to 90 to respect API limits
        days_needed = min(days_needed, 90)
        
        # We fire-and-forget to the queue. 
        # The user might not see data *instantly* in this request, 
        # but it prevents the server from crashing.
        await add_to_backfill_queue(coin, vs, days_needed)

    return await PriceData.find(
        PriceData.coin_id == coin,
        PriceData.vs_currency == vs,
        PriceData.timestamp >= from_ts,
        PriceData.timestamp <= to_ts
    ).sort("+timestamp").to_list()

@router.get("/coins/list")
async def get_supported_coins(uid: str = Depends(get_current_user)):
    """
    Returns top coins. Cached for 1 hour to respect CoinGecko limits.
    """
    global COIN_LIST_CACHE
    now = datetime.utcnow()
    
    if COIN_LIST_CACHE["data"] and now < COIN_LIST_CACHE["expires"]:
        return COIN_LIST_CACHE["data"]

    # Fetch Top 50 coins by market cap
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 50,
        "page": 1,
        "sparkline": "false"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
            # Map to our frontend format
            formatted = [
                {
                    "id": c["id"],
                    "symbol": c["symbol"].upper(),
                    "name": c["name"],
                    "image": c["image"],
                    "current_price": c["current_price"]
                }
                for c in data
            ]
            
            COIN_LIST_CACHE["data"] = formatted
            COIN_LIST_CACHE["expires"] = now + timedelta(hours=1)
            return formatted
        except Exception as e:
            # Fallback if API fails
            print(f"Coin list fetch error: {e}")
            return COIN_LIST_CACHE["data"] or []

@router.post("/pairs", status_code=201)
async def start_tracking(
    dto: PairDTO, 
    background_tasks: BackgroundTasks, 
    uid: str = Depends(get_current_user)
):
    # Validate with CoinGecko (Prevents Zombies & detects Rate Limits)
    # We use a quick, lightweight call to /simple/price
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": dto.coin_id, "vs_currencies": dto.vs_currency}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        
        if resp.status_code == 429:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="CoinGecko API rate limit reached. Please try again in 1 minute."
            )
        
        data = resp.json()
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset '{dto.coin_id}' not found on CoinGecko."
            )

    # Proceed after validation
    if not await User.find_one(User.firebase_uid == uid):
        await User(firebase_uid=uid).insert()

    exist = await TrackedPair.find_one(
        TrackedPair.user_id == uid,
        TrackedPair.coin_id == dto.coin_id,
        TrackedPair.vs_currency == dto.vs_currency
    )

    await add_to_backfill_queue(dto.coin_id, dto.vs_currency, 90)

    if exist:
        exist.status = "active"
        await exist.save()
        return exist

    return await TrackedPair(user_id=uid, coin_id=dto.coin_id, vs_currency=dto.vs_currency).insert()