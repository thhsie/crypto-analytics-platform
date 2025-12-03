from fastapi import APIRouter, HTTPException, Depends, Query
from app.db.models import TrackedPair, PriceData, User
from app.auth import get_current_user
from pydantic import BaseModel

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