from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os

from models import User
from database import get_session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get("JWT_SECRET", "devsecret")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict, expires_minutes: int = 60 * 24):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.post('/signup')
def signup(payload: dict, session=Depends(get_session)):
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='email and password required')
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail='user already exists')
    user = User(email=email, hashed_password=hash_password(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_token({"sub": str(user.id)})
    return {"token": token}

@router.post('/login')
def login(payload: dict, session=Depends(get_session)):
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='email and password required')
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail='invalid credentials')
    token = create_token({"sub": str(user.id)})
    return {"token": token}
