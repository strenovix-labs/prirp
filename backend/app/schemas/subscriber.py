from datetime import datetime
from pydantic import BaseModel, EmailStr

class SubscriberCreate(BaseModel):
    email: EmailStr

class SubscriberResponse(BaseModel):
    id: str
    email: str
    is_active: bool
    subscribed_at: datetime

    class Config:
        from_attributes = True
