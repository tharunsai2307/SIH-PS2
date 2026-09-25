"""SQLAlchemy ORM model for Standards Relationships Graph."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Relationship type taxonomy (Phase 3)
RELATIONSHIP_TYPES = [
    "normative_reference",
    "test_method",
    "terminology",
    "safety",
    "installation",
    "related_product",
    "certified_under",
    "supersedes",
]


class StandardRelationship(Base):
    __tablename__ = "standard_relationships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    relationship_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    strength: Mapped[float] = mapped_column(Float, default=1.0)  # 0.0 – 1.0 edge weight
    confidence: Mapped[str] = mapped_column(String(50), default="VERIFIED")
    source_reference: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    def __repr__(self) -> str:
        return f"<Rel {self.source_is_number} --[{self.relationship_type}]--> {self.target_is_number}>"
