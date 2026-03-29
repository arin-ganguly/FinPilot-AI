from __future__ import annotations

from app.schemas.user_schema import ScoreBreakdown, ScoreItem


def _clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(value, maximum))


def calculate_health_score(income: float, expenses: float, savings: float) -> tuple[int, ScoreBreakdown]:
    monthly_surplus = max(income - expenses, 0.0)
    savings_ratio_value = monthly_surplus / income if income else 0.0
    emergency_fund_value = savings / expenses if expenses else 12.0
    expense_ratio_value = expenses / income if income else 1.0

    savings_ratio_score = round(_clamp(savings_ratio_value / 0.25) * 40)
    emergency_fund_score = round(_clamp(emergency_fund_value / 6.0) * 30)
    expense_ratio_score = round(
        (
            1.0
            if expense_ratio_value <= 0.50
            else 0.0
            if expense_ratio_value >= 0.90
            else (0.90 - expense_ratio_value) / 0.40
        )
        * 30
    )

    total_score = int(savings_ratio_score + emergency_fund_score + expense_ratio_score)

    if total_score >= 80:
        summary = "Your finances are in strong shape with healthy saving capacity and resilience."
    elif total_score >= 60:
        summary = "Your financial base is decent, with room to improve consistency and safety buffers."
    elif total_score >= 40:
        summary = "You have a workable starting point, but tightening spending and growing savings should be the priority."
    else:
        summary = "Your financial foundation needs attention before taking on aggressive investments."

    breakdown = ScoreBreakdown(
        savings_ratio=ScoreItem(
            value=round(savings_ratio_value * 100, 2),
            score=savings_ratio_score,
            weight=40,
            benchmark="Target: save at least 25% of monthly income",
            explanation="This reflects how much of your monthly income remains after expenses.",
        ),
        emergency_fund=ScoreItem(
            value=round(emergency_fund_value, 2),
            score=emergency_fund_score,
            weight=30,
            benchmark="Target: keep 6 months of expenses as emergency savings",
            explanation="This measures how many months of expenses your current savings can cover.",
        ),
        expense_ratio=ScoreItem(
            value=round(expense_ratio_value * 100, 2),
            score=expense_ratio_score,
            weight=30,
            benchmark="Target: keep expenses below 50% of monthly income",
            explanation="A lower expense ratio gives you more flexibility to save and invest.",
        ),
        monthly_surplus=round(monthly_surplus, 2),
        summary=summary,
    )

    return total_score, breakdown
