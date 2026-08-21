import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# SQLite requires different connection flags for multi-threading access
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    SQLAlchemy session helper database dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
