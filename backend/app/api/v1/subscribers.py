from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.subscriber import VIPSubscriber
from app.models.user import User
from app.schemas.subscriber import SubscriberCreate, SubscriberResponse
from app.api.v1.auth import get_current_admin

router = APIRouter(prefix="/subscribers", tags=["VIP Collective Subscribers"])

@router.post("", response_model=SubscriberResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_vip(
    sub_in: SubscriberCreate,
    db: AsyncSession = Depends(get_db)
):
    email_clean = sub_in.email.strip().lower()
    result = await db.execute(select(VIPSubscriber).where(VIPSubscriber.email == email_clean))
    existing = result.scalar_one_or_none()

    if existing:
        if not existing.is_active:
            existing.is_active = True
            await db.commit()
            await db.refresh(existing)
        return existing

    subscriber = VIPSubscriber(email=email_clean)
    db.add(subscriber)
    await db.commit()
    await db.refresh(subscriber)
    return subscriber

@router.get("", response_model=List[SubscriberResponse])
async def list_subscribers(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(VIPSubscriber).order_by(VIPSubscriber.subscribed_at.desc()))
    return result.scalars().all()
