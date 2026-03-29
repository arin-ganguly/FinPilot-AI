from __future__ import annotations

from fastapi import APIRouter

from app.schemas.user_schema import ChatRequest, ChatResponse
from app.services.ai_engine import generate_chat_response


router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    reply = await generate_chat_response(payload)
    return ChatResponse(reply=reply)
