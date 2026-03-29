from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class RiskAppetite(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"


class ExpenseBreakdownInput(BaseModel):
    rent: float = Field(0, ge=0)
    food: float = Field(0, ge=0)
    transport: float = Field(0, ge=0)
    entertainment: float = Field(0, ge=0)
    others: float = Field(0, ge=0)

    @field_validator("rent", "food", "transport", "entertainment", "others")
    @classmethod
    def round_currency_values(cls, value: float) -> float:
        return round(value, 2)

    def total(self) -> float:
        return round(self.rent + self.food + self.transport + self.entertainment + self.others, 2)


class AnalyzeRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="User age in years")
    income: float = Field(..., gt=0, description="Monthly net income in INR")
    expenses: float = Field(..., ge=0, description="Monthly expenses in INR")
    savings: float = Field(..., ge=0, description="Current liquid savings in INR")
    risk_appetite: RiskAppetite
    expense_breakdown: ExpenseBreakdownInput | None = None

    @field_validator("income", "expenses", "savings")
    @classmethod
    def round_currency_values(cls, value: float) -> float:
        return round(value, 2)

    @model_validator(mode="after")
    def validate_financials(self) -> "AnalyzeRequest":
        resolved_expenses = self.expense_breakdown.total() if self.expense_breakdown else self.expenses
        self.expenses = round(resolved_expenses, 2)
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


class ExpenseDistributionItem(BaseModel):
    category: str
    amount: float
    percentage: float


class ExpenseBreakdownResponse(BaseModel):
    total_expenses: float
    categories: list[ExpenseDistributionItem]


class MarketDataSnapshot(BaseModel):
    symbol: str
    current_price: float | None = None
    one_year_return_pct: float | None = None
    as_of: str | None = None


class InvestmentRecommendation(BaseModel):
    name: str
    type: str
    risk_level: str
    expected_return_range: str
    market_data: MarketDataSnapshot | None = None


class InvestmentStrategy(BaseModel):
    allocation: dict[str, int]
    recommendations: list[InvestmentRecommendation]
    reasoning: str
    disclaimer: str


class AnalyzeResponse(BaseModel):
    health_score: int
    score_breakdown: ScoreBreakdown
    investment_plan: InvestmentPlan
    investment_strategy: InvestmentStrategy
    tax_suggestions: list[str]
    future_projection: list[ProjectionPoint]
    ai_advice: str
    expense_breakdown: ExpenseBreakdownResponse


class GoalPlanRequest(BaseModel):
    goal_name: str = Field(..., min_length=2, max_length=80)
    target_amount: float = Field(..., gt=0)
    years: int = Field(..., ge=1, le=40)
    current_sip: float = Field(..., ge=0)
    monthly_surplus: float | None = Field(None, ge=0)

    @field_validator("target_amount", "current_sip", "monthly_surplus")
    @classmethod
    def round_goal_values(cls, value: float | None) -> float | None:
        if value is None:
            return value
        return round(value, 2)


class GoalPlanResponse(BaseModel):
    goal_name: str
    required_sip: float
    current_sip: float
    gap: float
    feasibility_status: str


class FinancialContext(AnalyzeRequest):
    health_score: int | None = Field(None, ge=0, le=100)
    current_sip: float | None = Field(None, ge=0)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    financial_data: FinancialContext
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
