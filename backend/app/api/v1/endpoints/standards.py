"""Standards CRUD endpoints."""

from __future__ import annotations

import uuid

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.relationships import StandardRelationship
from app.models.standards import Standard
from app.schemas.analysis import RelationshipResponse, StandardResponse, StandardSummary

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.get("", response_model=list[StandardSummary], summary="List all standards")
async def list_standards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Standard).order_by(Standard.is_number))
    standards = result.scalars().all()
    return standards


@router.get("/{is_number}", response_model=StandardResponse, summary="Get standard by IS number")
async def get_standard(is_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Standard).where(Standard.is_number == is_number.upper())
    )
    std = result.scalar_one_or_none()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard {is_number} not found")
    return std


@router.get("/{is_number}/related", response_model=list[RelationshipResponse], summary="Get related standards")
async def get_related_standards(is_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StandardRelationship).where(
            StandardRelationship.source_is_number == is_number.upper()
        )
    )
    return result.scalars().all()
