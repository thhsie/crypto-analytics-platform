from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from app.db.models import TrackedPair, PriceData, User
from app.auth import get_current_user
from app.services.market_data import backfill_historical_data
from pydantic import BaseModel
import httpx
from datetime import datetime, timedelta

router = APIRouter()

class PairDTO(BaseModel):
    coin_id: str
    vs_currency: str

@router.post("/pairs", status_code=201)
async def start_tracking(dto: PairDTO, uid: str = Depends(get_current_user)):
    # Sync User
    if not await User.find_one(User.firebase_uid == uid):
        await User(firebase_uid=uid).insert()

    exist = await TrackedPair.find_one(
        TrackedPair.user_id == uid,
        TrackedPair.coin_id == dto.coin_id,
        TrackedPair.vs_currency == dto.vs_currency
    )
    if exist:
        exist.status = "active"
        await exist.save()
        return exist

    return await TrackedPair(user_id=uid, coin_id=dto.coin_id, vs_currency=dto.vs_currency).insert()

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
    return await PriceData.find(
        PriceData.coin_id == coin,
        PriceData.vs_currency == vs,
        PriceData.timestamp >= from_ts,
        PriceData.timestamp <= to_ts
    ).sort("+timestamp").to_list()

@router.get("/analytics/{coin}/{vs}/latest")
async def get_latest(coin: str, vs: str, uid: str = Depends(get_current_user)):
    latest = await PriceData.find(PriceData.coin_id == coin, PriceData.vs_currency == vs).sort("-timestamp").limit(1).to_list()
    if not latest: raise HTTPException(404, "No data")
    return latest[0]


COIN_LIST_CACHE = {
    "data": [],
    "expires": datetime.min
}

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
    background_tasks: BackgroundTasks, # Inject BackgroundTasks
    uid: str = Depends(get_current_user)
):
    # 1. Ensure User
    if not await User.find_one(User.firebase_uid == uid):
        await User(firebase_uid=uid).insert()

    # 2. Check if Pair Exists
    exist = await TrackedPair.find_one(
        TrackedPair.user_id == uid,
        TrackedPair.coin_id == dto.coin_id,
        TrackedPair.vs_currency == dto.vs_currency
    )

    # 3. Trigger Data Fetch (Background)
    # This runs AFTER the response is sent, so UI doesn't freeze, 
    # but data arrives shortly after.
    # We trigger this regardless of whether the user was already tracking it, 
    # just in case the data is stale.
    background_tasks.add_task(backfill_historical_data, dto.coin_id, dto.vs_currency, 7)

    if exist:
        exist.status = "active"
        await exist.save()
        return exist

    return await TrackedPair(user_id=uid, coin_id=dto.coin_id, vs_currency=dto.vs_currency).insert()