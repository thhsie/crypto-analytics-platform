from beanie import Document, Indexed
from pydantic import Field
from datetime import datetime
from pymongo import IndexModel, ASCENDING, DESCENDING

class User(Document):
    """
    Requirements: PDF Page 5
    Collection: users
    """
    firebase_uid: Indexed(str, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"

class TrackedPair(Document):
    """
    Requirements: PDF Page 5
    Collection: tracked_pairs
    Index: Unique on (user_id, coin_id, vs_currency)
    """
    user_id: Indexed(str)
    coin_id: str
    vs_currency: str
    status: str = "active" # 'active' | 'stopped'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tracked_pairs"
        indexes = [
            IndexModel(
                [("user_id", ASCENDING), ("coin_id", ASCENDING), ("vs_currency", ASCENDING)],
                unique=True
            )
        ]

class PriceData(Document):
    """
    Requirements: PDF Page 4 (Idempotent upserts)
    Collection: price_data
    Index: Compound on (coin, vs, timestamp)
    """
    coin_id: Indexed(str)
    vs_currency: Indexed(str)
    timestamp: Indexed(int) # Unix ms
    price: float
    volume: float
    provider: str = "coingecko"

    class Settings:
        name = "price_data"
        indexes = [
            IndexModel(
                [("coin_id", ASCENDING), ("vs_currency", ASCENDING), ("timestamp", DESCENDING)],
                unique=True
            )
        ]