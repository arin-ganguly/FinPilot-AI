from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.user_model import UserAnalysis
from app.schemas.user_schema import AnalyzeRequest, AnalyzeResponse, InvestmentPlan
from app.services.ai_engine import generate_financial_advice
from app.services.calculator import ANNUAL_RETURN, YEARS, allocation_hint, build_projection, calculate_future_value, recommend_monthly_investment
from app.services.scoring import calculate_health_score


router = APIRouter(tags=["analysis"])


def _split_tax_tips(tax_tips: str) -> list[str]:
    cleaned = tax_tips.replace("\r", "\n")
    parts = [part.strip(" -•\n\t") for chunk in cleaned.split("\n") for part in chunk.split(". ") if part.strip()]
    return parts[:5] or [
        "Use Section 80C instruments like PPF, ELSS, and EPF up to the eligible deduction limit.",
        "Claim health insurance premiums under Section 80D for yourself and dependents.",
        "Evaluate NPS contributions for additional tax deduction under Section 80CCD(1B).",
    ]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_finances(payload: AnalyzeRequest, db: Session = Depends(get_db)) -> AnalyzeResponse:
    health_score, score_breakdown = calculate_health_score(
        income=payload.income,
        expenses=payload.expenses,
        savings=payload.savings,
    )

    monthly_sip = recommend_monthly_investment(payload.income, payload.expenses, payload.risk_appetite)
    future_projection = build_projection(monthly_sip)
    projected_corpus = calculate_future_value(monthly_sip)

    ai_result = await generate_financial_advice(payload)
    tax_suggestions = _split_tax_tips(ai_result["tax_tips"])

    db.add(
        UserAnalysis(
            age=payload.age,
            income=payload.income,
            expenses=payload.expenses,
            savings=payload.savings,
            risk=payload.risk_appetite.value,
            score=health_score,
        )
    )
    db.commit()

    return AnalyzeResponse(
        health_score=health_score,
        score_breakdown=score_breakdown,
        investment_plan=InvestmentPlan(
            recommended_monthly_sip=monthly_sip,
            estimated_annual_return=round(ANNUAL_RETURN * 100, 2),
            horizon_years=YEARS,
            projected_corpus=projected_corpus,
            allocation_hint=allocation_hint(payload.risk_appetite),
            narrative=ai_result["investment_plan"],
        ),
        tax_suggestions=tax_suggestions,
        future_projection=future_projection,
        ai_advice=ai_result["advice"],
    )
