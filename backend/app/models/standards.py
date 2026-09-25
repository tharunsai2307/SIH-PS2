"""SQLAlchemy ORM model for BIS Standards."""

import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Standard(Base):
    __tablename__ = "standards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    is_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    year: Mapped[int | None] = mapped_column(Integer)
    scope: Mapped[str | None] = mapped_column(Text)
    product_type: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")  # ACTIVE, WITHDRAWN, SUPERSEDED

    # Structured requirement categories
    requirements: Mapped[dict | None] = mapped_column(JSONB)
    testing_requirements: Mapped[dict | None] = mapped_column(JSONB)
    certification_scheme: Mapped[dict | None] = mapped_column(JSONB)
    amendments: Mapped[list | None] = mapped_column(JSONB)

    # Evidence & traceability
    source_url: Mapped[str | None] = mapped_column(Text)
    source_reference: Mapped[str | None] = mapped_column(Text)
    confidence_level: Mapped[str] = mapped_column(String(50), default="VERIFIED")
    # VERIFIED | INSUFFICIENT_EVIDENCE | MANUAL_REVIEW

    # Search
    keywords: Mapped[list | None] = mapped_column(JSONB)
    embedding: Mapped[list | None] = mapped_column(Vector(768))  # Gemini embedding dim

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Standard {self.is_number}: {self.title}>"
