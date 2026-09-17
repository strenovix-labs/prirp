import uuid
import random
import string
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.order import Order, OrderItem
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.api.v1.auth import get_current_user, get_current_admin
from app.api.v1.promos import FALLBACK_PROMOS

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_number() -> str:
    random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"PRIRP-2026-{random_suffix}"

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    # Optional User link if token is provided
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]

    subtotal = 0.0
    for item in order_in.items:
        subtotal += item.unit_price * item.quantity

    # Calculate discount
    discount_percent = 0.0
    promo_code_clean = None
    if order_in.promo_code:
        promo_code_clean = order_in.promo_code.strip().upper()
        # Check DB
        result_promo = await db.execute(select(PromoCode).where(PromoCode.code == promo_code_clean))
        promo_db = result_promo.scalar_one_or_none()

        if promo_db and promo_db.is_active:
            discount_percent = promo_db.discount_percent
            promo_db.current_uses += 1
        elif promo_code_clean in FALLBACK_PROMOS:
            discount_percent = FALLBACK_PROMOS[promo_code_clean]["discount"]

    discount_amount = (subtotal * discount_percent) / 100.0
    total_amount = max(0.0, subtotal - discount_amount)

    order_num = generate_order_number()

    order = Order(
        order_number=order_num,
        user_id=user_id,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email.lower(),
        customer_phone=order_in.customer_phone,
        shipping_address=order_in.shipping_address.model_dump(),
        subtotal=round(subtotal, 2),
        discount_amount=round(discount_amount, 2),
        total_amount=round(total_amount, 2),
        promo_code=promo_code_clean,
        status="PENDING",
        payment_status="UNPAID"
    )
    db.add(order)
    await db.flush()  # get order.id

    for item_in in order_in.items:
        custom_name = None
        custom_num = None
        if item_in.customization:
            custom_name = item_in.customization.nameOnJersey
            custom_num = item_in.customization.jerseyNumber

        order_item = OrderItem(
            order_id=order.id,
            product_id=item_in.product_id,
            product_name=item_in.product_name,
            size=item_in.size,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            name_on_jersey=custom_name,
            jersey_number=custom_num
        )
        db.add(order_item)

    await db.commit()

    # Re-fetch order with items loaded
    result_order = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    full_order = result_order.scalar_one()

    return full_order

@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where((Order.user_id == current_user.id) | (Order.customer_email == current_user.email))
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{order_number}", response_model=OrderResponse)
async def get_order_by_number(
    order_number: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where((Order.order_number == order_number) | (Order.id == order_number))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.get("", response_model=List[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_in: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = status_in.status
    if status_in.payment_status:
        order.payment_status = status_in.payment_status

    await db.commit()
    await db.refresh(order)
    return order
