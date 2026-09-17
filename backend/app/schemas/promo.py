from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PromoValidateRequest(BaseModel):
    code: str

class PromoValidateResponse(BaseModel):
    success: bool
    code: str
    discount_percent: float
    message: str

class PromoCodeCreate(BaseModel):
    code: str
    discount_percent: float
    description: Optional[str] = None
    max_uses: int = 1000
    expires_at: Optional[datetime] = None

class PromoCodeResponse(BaseModel):
    id: str
    code: str
    discount_percent: float
    description: Optional[str] = None
    max_uses: int
    current_uses: int
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
