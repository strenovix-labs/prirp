import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # "drinks" | "tees" | "accessories"
    category_label: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g., "FLAGSHIP CAPSULE", "CORE TEE"
    price_usd: Mapped[str] = mapped_column(String(50), nullable=False)  # "$48.00"
    numeric_price: Mapped[float] = mapped_column(Float, nullable=False)  # 48.0
    price_inr: Mapped[str] = mapped_column(String(50), nullable=True)  # "₹2,699"
    tag: Mapped[str] = mapped_column(String(100), nullable=True)  # "BESTSELLER", "LIMITED // 500 UNITS"
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    sizes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # ["S", "M", "L", "XL"]
    colors: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # ["Obsidian Black"]
    gsm: Mapped[str] = mapped_column(String(100), nullable=True)  # "280 GSM Heavyweight Organic"
    stock_qty: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
