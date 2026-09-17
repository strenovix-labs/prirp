from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    category_label: Optional[str] = None
    price_usd: str
    numeric_price: float
    price_inr: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    gsm: Optional[str] = None
    stock_qty: int = 500
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price_usd: Optional[str] = None
    numeric_price: Optional[float] = None
    price_inr: Optional[str] = None
    stock_qty: Optional[int] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
