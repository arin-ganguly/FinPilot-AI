from __future__ import annotations

import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.schemas.user_schema import InvestmentRecommendation, InvestmentStrategy, MarketDataSnapshot, RiskAppetite


MARKET_DATA_TTL_SECONDS = 60 * 60 * 6
_MARKET_DATA_CACHE: dict[str, tuple[float, MarketDataSnapshot | None]] = {}


@dataclass(frozen=True)
class RecommendationTemplate:
    name: str
    type: str
    risk_level: str
    expected_return_range: str
    symbol: str | None = None


ALLOCATION_RULES: dict[RiskAppetite, dict[str, Any]] = {
    RiskAppetite.low: {
        "allocation": {"Equity": 30, "Debt": 70},
        "templates": [
            RecommendationTemplate("PPF", "Debt", "Low", "7% - 8%"),
            RecommendationTemplate("Government Bonds / Target Maturity Bonds", "Debt", "Low", "7% - 8.5%"),
            RecommendationTemplate("Nifty 50 Index Fund", "Equity", "Moderate", "11% - 14%", "NIFTYBEES.NS"),
        ],
        "reasoning": "Based on the low-risk profile, the strategy prioritizes capital preservation and steady compounding while keeping a smaller equity sleeve for long-term growth.",
    },
    RiskAppetite.moderate: {
        "allocation": {"Equity": 60, "Debt": 40},
        "templates": [
            RecommendationTemplate("Nifty 50 Index Fund", "Equity", "Moderate", "11% - 14%", "NIFTYBEES.NS"),
            RecommendationTemplate("Nifty Next 50 ETF", "Equity", "Moderate", "12% - 15%"),
            RecommendationTemplate("PPF / EPF", "Debt", "Low", "7% - 8.5%"),
            RecommendationTemplate("Debt Mutual Funds", "Debt", "Low to Moderate", "6.5% - 8.5%"),
        ],
        "reasoning": "Based on the moderate-risk profile, the strategy balances long-term growth through diversified equity exposure with debt instruments that help stabilize volatility.",
    },
    RiskAppetite.high: {
        "allocation": {"Equity": 80, "Debt": 20},
        "templates": [
            RecommendationTemplate("Nifty 50 Index Fund", "Equity", "Moderate", "11% - 14%", "NIFTYBEES.NS"),
            RecommendationTemplate("Nifty Next 50 ETF", "Equity", "High", "12% - 16%"),
            RecommendationTemplate("Nifty Midcap 150 Fund", "Equity", "High", "13% - 18%"),
            RecommendationTemplate("Debt Mutual Funds / PPF", "Debt", "Low", "6.5% - 8%"),
        ],
        "reasoning": "Based on the high-risk profile, the strategy leans heavily toward diversified equity for long-horizon wealth creation while keeping a smaller debt buffer for resilience.",
    },
}


def _now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _fetch_market_data(symbol: str) -> MarketDataSnapshot | None:
    cached = _MARKET_DATA_CACHE.get(symbol)
    current_time = time.time()
    if cached and current_time - cached[0] < MARKET_DATA_TTL_SECONDS:
        return cached[1]

    snapshot: MarketDataSnapshot | None = None
    try:
        import yfinance as yf

        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1y", interval="1d", auto_adjust=True)
        if history.empty:
            _MARKET_DATA_CACHE[symbol] = (current_time, None)
            return None

        close_prices = history["Close"].dropna()
        if close_prices.empty:
            _MARKET_DATA_CACHE[symbol] = (current_time, None)
            return None

        first_close = float(close_prices.iloc[0])
        last_close = float(close_prices.iloc[-1])
        one_year_return = ((last_close - first_close) / first_close) * 100 if first_close else None

        snapshot = MarketDataSnapshot(
            symbol=symbol,
            current_price=round(last_close, 2),
            one_year_return_pct=round(one_year_return, 2) if one_year_return is not None else None,
            as_of=_now_utc_iso(),
        )
    except Exception:
        snapshot = None

    _MARKET_DATA_CACHE[symbol] = (current_time, snapshot)
    return snapshot


def build_investment_strategy(risk_appetite: RiskAppetite) -> InvestmentStrategy:
    rule = ALLOCATION_RULES[risk_appetite]
    recommendations: list[InvestmentRecommendation] = []

    for template in rule["templates"]:
        recommendations.append(
            InvestmentRecommendation(
                name=template.name,
                type=template.type,
                risk_level=template.risk_level,
                expected_return_range=template.expected_return_range,
                market_data=_fetch_market_data(template.symbol) if template.symbol else None,
            )
        )

    return InvestmentStrategy(
        allocation=rule["allocation"],
        recommendations=recommendations,
        reasoning=rule["reasoning"],
        disclaimer="Data is for educational purposes only.",
    )
