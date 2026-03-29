from __future__ import annotations

from fastapi import APIRouter

from app.schemas.user_schema import GoalPlanRequest, GoalPlanResponse
from app.services.calculator import assess_goal_feasibility, calculate_required_monthly_investment


router = APIRouter(tags=["goal-planning"])


@router.post("/goal-plan", response_model=GoalPlanResponse)
async def goal_plan(payload: GoalPlanRequest) -> GoalPlanResponse:
    required_sip = calculate_required_monthly_investment(payload.target_amount, payload.years)
    gap, feasibility_status = assess_goal_feasibility(required_sip, payload.current_sip, payload.monthly_surplus)

    return GoalPlanResponse(
        goal_name=payload.goal_name,
        required_sip=required_sip,
        current_sip=round(payload.current_sip, 2),
        gap=gap,
        feasibility_status=feasibility_status,
    )
