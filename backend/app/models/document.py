from datetime import datetime

from sqlalchemy import DateTime, Integer, Text, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    document_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    analysis_json: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    evidence_json: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )