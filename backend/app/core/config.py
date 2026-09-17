import os
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PRIRP Energy Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://user:password@ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/neondb",
        description="Async Database connection URL (PostgreSQL asyncpg or SQLite aiosqlite)"
    )

    # Security
    SECRET_KEY: str = Field(default="prirp_sub_zero_glacial_secret_key_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder_key"
    RAZORPAY_KEY_SECRET: str = "rzp_test_placeholder_secret"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        # Clean potential trailing artifacts
        if "PORT=" in url:
            url = url.split("PORT=")[0].strip()

        # Convert driver prefix
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        # For Neon non-pooled/pooled asyncpg, remove URL query params as SSL is passed via connect_args
        if "asyncpg" in url and "?" in url:
            url = url.split("?")[0]

        return url

settings = Settings()