from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from urllib import error, request

from dotenv import load_dotenv

from app.schemas.user_schema import AnalyzeRequest


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


OLLAMA_PROMPT_TEMPLATE = """
You are a financial advisor for Indian users.

User Data:
Age: {age}
Income: {income}
Expenses: {expenses}
Savings: {savings}
Risk: {risk}

Tasks:
1. Give financial advice
2. Suggest SIP investment plan
3. Suggest tax-saving strategies with India-specific sections like 80C, 80D, ELSS, PPF, and NPS
4. Return valid JSON only in this exact shape:
{{
  "advice": "",
  "investment_plan": "",
  "tax_tips": ""
}}
""".strip()


JSON_OUTPUT_INSTRUCTION = (
    "Return only valid JSON. Do not include markdown fences, explanations, or extra text outside the JSON object."
)


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


def _extract_json_payload(raw_response: str) -> dict[str, str]:
    text = raw_response.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:].strip()

    parsed = json.loads(text)
    return {
        "advice": str(parsed.get("advice", "")).strip(),
        "investment_plan": str(parsed.get("investment_plan", "")).strip(),
        "tax_tips": str(parsed.get("tax_tips", "")).strip(),
    }


def _call_ollama(prompt: str, base_url: str, model: str) -> dict[str, str]:
    endpoint = f"{base_url.rstrip('/')}/api/generate"
    payload = {
        "model": model,
        "prompt": f"{prompt}\n\n{JSON_OUTPUT_INSTRUCTION}",
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.3,
        },
    }

    body = json.dumps(payload).encode("utf-8")
    ollama_request = request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with request.urlopen(ollama_request, timeout=45) as response:
        response_body = response.read().decode("utf-8")

    parsed_response = json.loads(response_body)
    model_output = str(parsed_response.get("response", "")).strip()
    return _extract_json_payload(model_output)


async def generate_financial_advice(payload: AnalyzeRequest) -> dict[str, str]:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    prompt = OLLAMA_PROMPT_TEMPLATE.format(
        age=payload.age,
        income=payload.income,
        expenses=payload.expenses,
        savings=payload.savings,
        risk=payload.risk_appetite.value,
    )

    try:
        return await asyncio.to_thread(_call_ollama, prompt, base_url, model)
    except (error.URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return _fallback_advice(payload)
    except Exception:
        return _fallback_advice(payload)
