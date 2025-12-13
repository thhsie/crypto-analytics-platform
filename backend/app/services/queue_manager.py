import asyncio
from app.services.market_data import backfill_historical_data

# Global Queue
backfill_queue = asyncio.Queue()
# Set to track pending items to avoid duplicates in the queue
pending_tasks = set()

def is_task_pending(coin_id: str, vs_currency: str) -> bool:
    return f"{coin_id}:{vs_currency}" in pending_tasks

async def add_to_backfill_queue(coin_id: str, vs_currency: str, days: int):
    """
    Adds a task to the queue if it's not already pending.
    """
    key = f"{coin_id}:{vs_currency}"
    if key in pending_tasks:
        print(f"[Queue] Task for {key} already pending. Skipping.")
        return

    print(f"[Queue] Enqueuing backfill for {key}")
    pending_tasks.add(key)
    await backfill_queue.put((coin_id, vs_currency, days))

async def backfill_worker():
    """
    Consumes tasks from the queue with rate limiting.
    """
    print("[Queue] Worker started.")
    while True:
        try:
            # 1. Get task
            coin_id, vs_currency, days = await backfill_queue.get()
            key = f"{coin_id}:{vs_currency}"

            # 2. Process
            await backfill_historical_data(coin_id, vs_currency, days)
            
            # 3. Cleanup & Rate Limit
            # CRITICAL: We only remove it from 'pending' AFTER the work is totally done
            if key in pending_tasks:
                pending_tasks.remove(key)

            backfill_queue.task_done()
            
            # 4. SLEEP: The most important part.
            # Enforce max 1 request every 6 seconds (~10 reqs/min) to be safe.
            await asyncio.sleep(6)
            
        except asyncio.CancelledError:
            print("[Queue] Worker cancelled.")
            break
        except Exception as e:
            print(f"[Queue] Error in worker: {e}")
            # Ensure we remove from pending so it can be retried later
            if 'key' in locals() and key in pending_tasks:
                pending_tasks.remove(key)