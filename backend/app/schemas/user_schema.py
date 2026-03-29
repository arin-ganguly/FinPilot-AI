from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class RiskAppetite(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"


class AnalyzeRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="User age in years")
    income: float = Field(..., gt=0, description="Monthly net income in INR")
    expenses: float = Field(..., ge=0, description="Monthly expenses in INR")
    savings: float = Field(..., ge=0, description="Current liquid savings in INR")
    risk_appetite: RiskAppetite

    @field_validator("income", "expenses", "savings")
    @classmethod
    def round_currency_values(cls, value: float) -> float:
        return round(value, 2)

    @model_validator(mode="after")
    def validate_financials(self) -> "AnalyzeRequest":
        if self.expenses > self.income * 1.5:
            raise ValueError("Expenses look unusually high. Please review the entered monthly values.")
        return self


class ScoreItem(BaseModel):
    value: float
    score: int
    weight: int
    benchmark: str
    explanation: str


class ScoreBreakdown(BaseModel):
    savings_ratio: ScoreItem
    emergency_fund: ScoreItem
    expense_ratio: ScoreItem
    monthly_surplus: float
    summary: str


class ProjectionPoint(BaseModel):
    year: int
    invested_amount: float
    projected_value: float


class InvestmentPlan(BaseModel):
    recommended_monthly_sip: float
    estimated_annual_return: float
    horizon_years: int
    projected_corpus: float
    allocation_hint: str
    narrative: str


class AnalyzeResponse(BaseModel):
    health_score: int
    score_breakdown: ScoreBreakdown
    investment_plan: InvestmentPlan
    tax_suggestions: list[str]
    future_projection: list[ProjectionPoint]
    ai_advice: str
