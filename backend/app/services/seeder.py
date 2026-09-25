"""
Database seeder — populates the PostgreSQL database with the mock BIS dataset.
Run once after database tables are created.
Usage: python -m app.services.seeder
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow running as a script
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, init_db
from app.core.logging import setup_logging
from app.models.relationships import StandardRelationship
from app.models.standards import Standard

setup_logging()
logger = structlog.get_logger(__name__)


async def seed_standards(db: AsyncSession, standards_data: list[dict]) -> dict[str, Standard]:
    """Insert or update standards."""
    seeded: dict[str, Standard] = {}
    for data in standards_data:
        # Check if exists
        result = await db.execute(
            select(Standard).where(Standard.is_number == data["is_number"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            logger.info("Standard already exists, skipping", is_number=data["is_number"])
            seeded[data["is_number"]] = existing
            continue

        std = Standard(
            is_number=data["is_number"],
            title=data["title"],
            year=data.get("year"),
            product_type=data.get("product_type"),
            status=data.get("status", "ACTIVE"),
            scope=data.get("scope"),
            requirements=data.get("requirements"),
            testing_requirements=data.get("testing_requirements"),
            certification_scheme=data.get("certification_scheme"),
            amendments=data.get("amendments", []),
            keywords=data.get("keywords", []),
            source_url=data.get("source_url"),
            source_reference=data.get("source_reference"),
            confidence_level=data.get("confidence_level", "VERIFIED"),
        )
        db.add(std)
        seeded[data["is_number"]] = std
        logger.info("Seeded standard", is_number=data["is_number"])

    await db.commit()
    return seeded


async def seed_relationships(db: AsyncSession, relationships_data: list[dict]) -> None:
    """Insert relationships."""
    for data in relationships_data:
        # Check if exists
        result = await db.execute(
            select(StandardRelationship).where(
                StandardRelationship.source_is_number == data["source"],
                StandardRelationship.target_is_number == data["target"],
                StandardRelationship.relationship_type == data["type"],
            )
        )
        if result.scalar_one_or_none():
            logger.info("Relationship already exists, skipping",
                        source=data["source"], target=data["target"])
            continue

        rel = StandardRelationship(
            source_is_number=data["source"],
            target_is_number=data["target"],
            relationship_type=data["type"],
            description=data.get("description"),
            strength=data.get("strength", 1.0),
            confidence="VERIFIED",
        )
        db.add(rel)
        logger.info("Seeded relationship", source=data["source"], target=data["target"],
                    type=data["type"])

    await db.commit()


async def run_seed():
    from data.standards_seed import RELATIONSHIPS_DATA, STANDARDS_DATA

    logger.info("Starting database seed")
    await init_db()

    async with AsyncSessionLocal() as db:
        await seed_standards(db, STANDARDS_DATA)
        await seed_relationships(db, RELATIONSHIPS_DATA)

    logger.info("Database seed complete")


if __name__ == "__main__":
    asyncio.run(run_seed())
