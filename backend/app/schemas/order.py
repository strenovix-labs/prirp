from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class CustomizationSchema(BaseModel):
    nameOnJersey: Optional[str] = None
    jerseyNumber: Optional[str] = None

class ShippingAddressSchema(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "US"

class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    size: str = "M"
    quantity: int = 1
    unit_price: float
    customization: Optional[CustomizationSchema] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    size: str
    quantity: int
    unit_price: float
    name_on_jersey: Optional[str] = None
    jersey_number: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    shipping_address: ShippingAddressSchema
    items: List[OrderItemCreate]
    promo_code: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    payment_status: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    shipping_address: ShippingAddressSchema
    subtotal: float
    discount_amount: float
    total_amount: float
    promo_code: Optional[str] = None
    status: str
    payment_status: str
    payment_id: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
