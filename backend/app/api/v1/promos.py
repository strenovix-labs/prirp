from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.promo import PromoValidateRequest, PromoValidateResponse, PromoCodeCreate, PromoCodeResponse
from app.api.v1.auth import get_current_admin

router = APIRouter(prefix="/promos", tags=["Promos"])

# Hardcoded fallback vault promo codes matching frontend rules
FALLBACK_PROMOS = {
    "PRIRP10": {"discount": 10.0, "message": "10% VIP DISCOUNT APPLIED"},
    "SUBZERO": {"discount": 10.0, "message": "10% SUB-ZERO DISCOUNT APPLIED"},
    "ENERGY10": {"discount": 10.0, "message": "10% ENERGY DISCOUNT APPLIED"},
    "PRIRP20": {"discount": 20.0, "message": "20% VIP DROP DISCOUNT APPLIED"},
    "CREW20": {"discount": 20.0, "message": "20% CREW DROP DISCOUNT APPLIED"},
}

@router.post("/validate", response_model=PromoValidateResponse)
async def validate_promo(
    req: PromoValidateRequest,
    db: AsyncSession = Depends(get_db)
):
    code_clean = req.code.strip().upper()
    if not code_clean:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Promo code cannot be empty")

    # Check DB first
    result = await db.execute(select(PromoCode).where(PromoCode.code == code_clean))
    promo = result.scalar_one_or_none()

    if promo:
        now = datetime.now(timezone.utc)
        if not promo.is_active:
            return PromoValidateResponse(success=False, code=code_clean, discount_percent=0.0, message="PROMO CODE INACTIVE")
        if promo.expires_at and promo.expires_at < now:
            return PromoValidateResponse(success=False, code=code_clean, discount_percent=0.0, message="PROMO CODE EXPIRED")
        if promo.current_uses >= promo.max_uses:
            return PromoValidateResponse(success=False, code=code_clean, discount_percent=0.0, message="PROMO CODE USAGE LIMIT REACHED")

        return PromoValidateResponse(
            success=True,
            code=code_clean,
            discount_percent=promo.discount_percent,
            message=f"{int(promo.discount_percent)}% DISCOUNT APPLIED"
        )

    # Check fallback dictionary
    if code_clean in FALLBACK_PROMOS:
        item = FALLBACK_PROMOS[code_clean]
        return PromoValidateResponse(
            success=True,
            code=code_clean,
            discount_percent=item["discount"],
            message=item["message"]
        )

    return PromoValidateResponse(
        success=False,
        code=code_clean,
        discount_percent=0.0,
        message="INVALID OR EXPIRED VAULT CODE"
    )

@router.post("", response_model=PromoCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_promo(
    promo_in: PromoCodeCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    code_clean = promo_in.code.strip().upper()
    existing = await db.execute(select(PromoCode).where(PromoCode.code == code_clean))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Promo code already exists")

    promo = PromoCode(
        code=code_clean,
        discount_percent=promo_in.discount_percent,
        description=promo_in.description,
        max_uses=promo_in.max_uses,
        expires_at=promo_in.expires_at
    )
    db.add(promo)
    await db.commit()
    await db.refresh(promo)
    return promo

@router.get("", response_model=List[PromoCodeResponse])
async def list_promos(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(PromoCode).order_by(PromoCode.created_at.desc()))
    return result.scalars().all()
