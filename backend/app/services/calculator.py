from __future__ import annotations

from app.schemas.user_schema import ExpenseBreakdownInput, ExpenseBreakdownResponse, ExpenseDistributionItem, RiskAppetite


ANNUAL_RETURN = 0.12
YEARS = 10


def calculate_future_value(monthly_investment: float, annual_return: float = ANNUAL_RETURN, years: int = YEARS) -> float:
    if monthly_investment <= 0:
        return 0.0

    monthly_rate = annual_return / 12
    months = years * 12
    future_value = monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
    return round(future_value, 2)


def calculate_required_monthly_investment(target_amount: float, years: int, annual_return: float = ANNUAL_RETURN) -> float:
    if target_amount <= 0 or years <= 0:
        return 0.0

    monthly_rate = annual_return / 12
    months = years * 12
    growth_factor = (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
    if growth_factor <= 0:
        return 0.0
    return round(target_amount / growth_factor, 2)


def build_projection(monthly_investment: float, annual_return: float = ANNUAL_RETURN, years: int = YEARS) -> list[dict[str, float | int]]:
    projection: list[dict[str, float | int]] = []
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
            {
                "year": year,
                "invested_amount": invested_amount,
                "projected_value": projected_value,
            }
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


def build_expense_breakdown(expense_breakdown: ExpenseBreakdownInput | None, total_expenses: float) -> ExpenseBreakdownResponse:
    if expense_breakdown is None:
        categories = [
            ExpenseDistributionItem(
                category="Uncategorized",
                amount=round(total_expenses, 2),
                percentage=100.0 if total_expenses > 0 else 0.0,
            )
        ]
        return ExpenseBreakdownResponse(total_expenses=round(total_expenses, 2), categories=categories)

    raw_categories = {
        "Rent": expense_breakdown.rent,
        "Food": expense_breakdown.food,
        "Transport": expense_breakdown.transport,
        "Entertainment": expense_breakdown.entertainment,
        "Others": expense_breakdown.others,
    }

    categories = [
        ExpenseDistributionItem(
            category=category,
            amount=round(amount, 2),
            percentage=round((amount / total_expenses) * 100, 2) if total_expenses > 0 else 0.0,
        )
        for category, amount in raw_categories.items()
    ]
    return ExpenseBreakdownResponse(total_expenses=round(total_expenses, 2), categories=categories)


def assess_goal_feasibility(required_sip: float, current_sip: float, monthly_surplus: float | None = None) -> tuple[float, str]:
    gap = round(max(required_sip - current_sip, 0.0), 2)

    if gap <= 0:
        return gap, "On Track"
    if monthly_surplus is not None and required_sip <= monthly_surplus:
        return gap, "Reachable with a higher SIP"
    if monthly_surplus is not None and monthly_surplus <= 0:
        return gap, "Needs surplus before investing"
    return gap, "Gap to close"
