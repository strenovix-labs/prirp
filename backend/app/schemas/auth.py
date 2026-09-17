from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class SavedAddressSchema(BaseModel):
    id: str
    tag: str = "HOME"  # HOME, WORK, OTHER
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "US"
    is_default: bool = False

class SavedAddressCreate(BaseModel):
    tag: str = "HOME"
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "US"
    is_default: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    saved_addresses: Optional[List[SavedAddressSchema]] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
