from typing import AsyncGenerator
import ssl as python_ssl
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine_kwargs = {}
db_url = settings.async_database_url

if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif "postgresql+asyncpg" in db_url:
    ssl_ctx = python_ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = python_ssl.CERT_NONE
    engine_kwargs["connect_args"] = {
        "ssl": ssl_ctx,
        "timeout": 15.0,
        "command_timeout": 30.0,
        "statement_cache_size": 0,
    }
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
