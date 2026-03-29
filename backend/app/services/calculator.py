from __future__ import annotations

from app.schemas.user_schema import ProjectionPoint, RiskAppetite


ANNUAL_RETURN = 0.12
YEARS = 10


def calculate_future_value(monthly_investment: float, annual_return: float = ANNUAL_RETURN, years: int = YEARS) -> float:
    if monthly_investment <= 0:
        return 0.0

    monthly_rate = annual_return / 12
    months = years * 12
    future_value = monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
    return round(future_value, 2)


def build_projection(monthly_investment: float, annual_return: float = ANNUAL_RETURN, years: int = YEARS) -> list[ProjectionPoint]:
    projection: list[ProjectionPoint] = []
    monthly_rate = annual_return / 12

    for year in range(1, years + 1):
        months = year * 12
        invested_amount = round(monthly_investment * months, 2)
        projected_value = (
            0.0
            if monthly_investment <= 0
            else round(monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate), 2)
        )
        projection.append(
            ProjectionPoint(
                year=year,
                invested_amount=invested_amount,
                projected_value=projected_value,
            )
        )

    return projection


def recommend_monthly_investment(income: float, expenses: float, risk_appetite: RiskAppetite) -> float:
    monthly_surplus = max(income - expenses, 0.0)
    risk_ratio = {
        RiskAppetite.low: 0.35,
        RiskAppetite.moderate: 0.50,
        RiskAppetite.high: 0.65,
    }[risk_appetite]

    if monthly_surplus <= 0:
        return 0.0

    recommended = monthly_surplus * risk_ratio
    practical_floor = min(monthly_surplus, 1000.0)
    return round(max(recommended, practical_floor), 2)


def allocation_hint(risk_appetite: RiskAppetite) -> str:
    if risk_appetite == RiskAppetite.low:
        return "Lean toward a conservative mix such as 30% equity, 50% debt, and 20% liquid instruments."
    if risk_appetite == RiskAppetite.moderate:
        return "A balanced allocation such as 60% equity, 25% debt, and 15% liquid funds can fit this profile."
    return "An equity-forward allocation such as 75% equity, 15% debt, and 10% liquid assets can suit long-term growth."
