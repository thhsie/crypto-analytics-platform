from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials, initialize_app
import os

# Init Firebase Admin
# Fix: Check firebase_admin._apps, not auth._apps
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
    else:
        print("WARNING: Firebase credentials missing")

security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verifies JWT token and returns Firebase UID.
    """
    try:
        decoded_token = auth.verify_id_token(token.credentials)
        return decoded_token['uid']
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )