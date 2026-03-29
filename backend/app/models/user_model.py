from __future__ import annotations

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class UserAnalysis(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    income: Mapped[float] = mapped_column(Float, nullable=False)
    expenses: Mapped[float] = mapped_column(Float, nullable=False)
    savings: Mapped[float] = mapped_column(Float, nullable=False)
    risk: Mapped[str] = mapped_column(String(20), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
