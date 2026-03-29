from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from urllib import error, request

from dotenv import load_dotenv

from app.schemas.user_schema import AnalyzeRequest, ChatRequest


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


OLLAMA_PROMPT_TEMPLATE = """
Financial advisor for Indian users.
Return only valid JSON with keys advice, investment_plan, tax_tips.
Keep each value concise, practical, and under 45 words.
Mention India-specific tax ideas such as 80C, 80D, ELSS, PPF, and NPS when relevant.

User:
age={age}
income={income}
expenses={expenses}
savings={savings}
risk={risk}
""".strip()

CHAT_SYSTEM_PROMPT = """
You are FinPilot AI, a practical personal finance assistant for Indian users.
Keep answers concise, helpful, and action-oriented.
Reference the user's financial data when relevant.
Do not give legal guarantees or promise returns.
""".strip()


def _ollama_settings() -> tuple[str, str, float]:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    timeout_seconds = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "90"))
    return base_url, model, timeout_seconds


def _fallback_advice(payload: AnalyzeRequest) -> dict[str, str]:
    monthly_surplus = max(payload.income - payload.expenses, 0.0)
    advice = (
        f"Your monthly surplus is approximately INR {monthly_surplus:,.0f}. "
        "Protect at least 6 months of expenses in a liquid emergency fund before taking higher investment risk."
    )
    investment_plan = (
        "Start with a disciplined SIP aligned to your surplus, increase it by 10% every year, "
        "and prefer diversified mutual funds based on your risk appetite."
    )
    tax_tips = (
        "Use Section 80C for PPF, ELSS, EPF or life insurance premiums, "
        "claim health insurance under 80D, and consider NPS under 80CCD(1B) for extra deduction."
    )
    return {
        "advice": advice,
        "investment_plan": investment_plan,
        "tax_tips": tax_tips,
    }


def _fallback_chat_response(payload: ChatRequest) -> str:
    monthly_surplus = max(payload.financial_data.income - payload.financial_data.expenses, 0.0)
    return (
        f"I could not reach the local Ollama model just now, but based on your numbers your monthly surplus is about INR {monthly_surplus:,.0f}. "
        "Ask me about budgeting, goal planning, tax saving, or improving your SIP and I can still guide you with the available data."
    )


def _extract_json_payload(raw_response: str) -> dict[str, str]:
    text = raw_response.strip()
    candidates = [text]

    if text.startswith("```"):
        stripped = text.strip("`")
        if stripped.startswith("json"):
            stripped = stripped[4:].strip()
        candidates.append(stripped)

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidates.append(text[start : end + 1])

    parsed: dict[str, str] | None = None
    for candidate in candidates:
        try:
            loaded = json.loads(candidate)
            if isinstance(loaded, dict):
                parsed = loaded
                break
        except json.JSONDecodeError:
            continue

    if parsed is None:
        raise ValueError("Ollama did not return valid JSON.")

    result = {
        "advice": str(parsed.get("advice", "")).strip(),
        "investment_plan": str(parsed.get("investment_plan", "")).strip(),
        "tax_tips": str(parsed.get("tax_tips", "")).strip(),
    }
    if not any(result.values()):
        raise ValueError("Ollama returned an empty payload.")
    return result


def _post_ollama(endpoint: str, payload: dict, timeout_seconds: float) -> dict:
    body = json.dumps(payload).encode("utf-8")
    ollama_request = request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with request.urlopen(ollama_request, timeout=timeout_seconds) as response:
        response_body = response.read().decode("utf-8")
    return json.loads(response_body)


def _call_ollama_json(prompt: str, base_url: str, model: str, timeout_seconds: float) -> dict[str, str]:
    endpoint = f"{base_url.rstrip('/')}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "keep_alive": "10m",
        "options": {
            "temperature": 0.1,
            "num_predict": 160,
        },
    }

    parsed_response = _post_ollama(endpoint, payload, timeout_seconds)
    model_output = str(parsed_response.get("response", "")).strip()
    return _extract_json_payload(model_output)


def _serialize_expense_breakdown(payload: AnalyzeRequest) -> str:
    if payload.expense_breakdown is None:
        return f"Total expenses: {payload.expenses}"
    return (
        f"rent={payload.expense_breakdown.rent}, food={payload.expense_breakdown.food}, "
        f"transport={payload.expense_breakdown.transport}, entertainment={payload.expense_breakdown.entertainment}, "
        f"others={payload.expense_breakdown.others}, total={payload.expenses}"
    )


def _call_ollama_chat(payload: ChatRequest, base_url: str, model: str, timeout_seconds: float) -> str:
    endpoint = f"{base_url.rstrip('/')}/api/chat"
    financial_context = (
        "Financial context:\n"
        f"- Age: {payload.financial_data.age}\n"
        f"- Monthly income: INR {payload.financial_data.income}\n"
        f"- Monthly expenses: INR {payload.financial_data.expenses}\n"
        f"- Savings: INR {payload.financial_data.savings}\n"
        f"- Risk appetite: {payload.financial_data.risk_appetite.value}\n"
        f"- Expense breakdown: {_serialize_expense_breakdown(payload.financial_data)}\n"
        f"- Money health score: {payload.financial_data.health_score or 'unknown'}\n"
        f"- Current SIP: INR {payload.financial_data.current_sip or 0}\n"
    )

    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    messages.extend({"role": item.role, "content": item.content} for item in payload.history)
    messages.append(
        {
            "role": "user",
            "content": f"{financial_context}\nUser question: {payload.message}",
        }
    )

    parsed_response = _post_ollama(
        endpoint,
        {
            "model": model,
            "messages": messages,
            "stream": False,
            "keep_alive": "10m",
            "options": {
                "temperature": 0.2,
                "num_predict": 220,
            },
        },
        timeout_seconds,
    )

    reply = str(parsed_response.get("message", {}).get("content", "")).strip()
    if not reply:
        raise ValueError("Ollama returned an empty chat response.")
    return reply


async def generate_financial_advice(payload: AnalyzeRequest) -> dict[str, str]:
    base_url, model, timeout_seconds = _ollama_settings()
    prompt = OLLAMA_PROMPT_TEMPLATE.format(
        age=payload.age,
        income=payload.income,
        expenses=payload.expenses,
        savings=payload.savings,
        risk=payload.risk_appetite.value,
    )

    try:
        return await asyncio.to_thread(_call_ollama_json, prompt, base_url, model, timeout_seconds)
    except (error.URLError, TimeoutError, json.JSONDecodeError, ValueError, OSError):
        return _fallback_advice(payload)
    except Exception:
        return _fallback_advice(payload)


async def generate_chat_response(payload: ChatRequest) -> str:
    base_url, model, timeout_seconds = _ollama_settings()
    try:
        return await asyncio.to_thread(_call_ollama_chat, payload, base_url, model, timeout_seconds)
    except (error.URLError, TimeoutError, json.JSONDecodeError, ValueError, OSError):
        return _fallback_chat_response(payload)
    except Exception:
        return _fallback_chat_response(payload)
