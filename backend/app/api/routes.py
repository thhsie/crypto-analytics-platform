from fastapi import APIRouter, HTTPException, Query
from app.db.models import TrackedPair, PriceData
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PairDTO(BaseModel):
    coin_id: str
    vs_currency: str

# 1. Start Tracking (POST)
@router.post("/pairs", status_code=201)
async def start_tracking(dto: PairDTO):
    # Temp user for Iteration 2 (Removed in 2.5)
    uid = "temp_dev_user"
    
    # Idempotency
    exist = await TrackedPair.find_one(
        TrackedPair.user_id == uid,
        TrackedPair.coin_id == dto.coin_id,
        TrackedPair.vs_currency == dto.vs_currency
    )
    
    if exist:
        exist.status = "active"
        await exist.save()
        return exist

    new_pair = TrackedPair(
        user_id=uid,
        coin_id=dto.coin_id,
        vs_currency=dto.vs_currency,
        status="active"
    )
    await new_pair.insert()
    return new_pair

# 2. List Pairs (GET)
@router.get("/pairs")
async def list_pairs():
    uid = "temp_dev_user"
    return await TrackedPair.find(
        TrackedPair.user_id == uid, 
        TrackedPair.status == "active"
    ).to_list()

# 3. Stop Tracking (DELETE)
@router.delete("/pairs/{coin}/{vs}")
async def stop_tracking(coin: str, vs: str):
    uid = "temp_dev_user"
    pair = await TrackedPair.find_one(
        TrackedPair.user_id == uid,
        TrackedPair.coin_id == coin,
        TrackedPair.vs_currency == vs
    )
    if pair:
        pair.status = "stopped"
        await pair.save()
    return {"status": "stopped"}

# 4. Analytics Range (GET)
@router.get("/analytics/{coin}/{vs}")
async def get_analytics(
    coin: str, 
    vs: str, 
    from_ts: int = Query(alias="from"), 
    to_ts: int = Query(alias="to")
):
    return await PriceData.find(
        PriceData.coin_id == coin,
        PriceData.vs_currency == vs,
        PriceData.timestamp >= from_ts,
        PriceData.timestamp <= to_ts
    ).sort("+timestamp").to_list()

# 5. Analytics Latest (GET)
@router.get("/analytics/{coin}/{vs}/latest")
async def get_latest(coin: str, vs: str):
    latest = await PriceData.find(
        PriceData.coin_id == coin,
        PriceData.vs_currency == vs
    ).sort("-timestamp").limit(1).to_list()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No data found")
    return latest[0]