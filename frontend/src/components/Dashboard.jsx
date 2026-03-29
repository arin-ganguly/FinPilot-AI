import { useState } from "react";

import ChartComponent from "./ChartComponent";
import ScoreCard from "./ScoreCard";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function calculateFutureValue(monthlyInvestment, annualReturn = 0.12, years = 10) {
  if (!monthlyInvestment) {
    return 0;
  }

  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  return monthlyInvestment * ((((1 + monthlyRate) ** months) - 1) / monthlyRate) * (1 + monthlyRate);
}

function Dashboard({ result, inputs }) {
  const [simulatorSip, setSimulatorSip] = useState(result.investment_plan.recommended_monthly_sip || 1000);
  const projectedSimulatorValue = calculateFutureValue(Number(simulatorSip || 0));

  return (
    <div className="result-layout">
      <div className="result-header fade-up">
        <div>
          <span className="eyebrow">Decision engine output</span>
          <h1>Your personalized financial cockpit</h1>
          <p>
            Based on age {inputs.age}, monthly income {currencyFormatter.format(inputs.income)}, expenses {currencyFormatter.format(inputs.expenses)}, and a {inputs.risk_appetite} risk profile.
          </p>
        </div>
        <div className="summary-pills">
          <div className="summary-pill">
            <span>Monthly surplus</span>
            <strong>{currencyFormatter.format(result.score_breakdown.monthly_surplus)}</strong>
          </div>
          <div className="summary-pill">
            <span>Projected corpus</span>
            <strong>{currencyFormatter.format(result.investment_plan.projected_corpus)}</strong>
          </div>
        </div>
      </div>

      <ScoreCard healthScore={result.health_score} scoreBreakdown={result.score_breakdown} />

      <div className="dashboard-grid">
        <section className="card fade-up">
          <div className="section-heading compact">
            <span className="eyebrow">AI guidance</span>
            <h3>Recommended next moves</h3>
          </div>
          <p className="body-copy">{result.ai_advice}</p>
        </section>

        <section className="card fade-up">
          <div className="section-heading compact">
            <span className="eyebrow">Investment plan</span>
            <h3>SIP recommendation</h3>
          </div>
          <div className="data-stack">
            <div>
              <span>Suggested monthly SIP</span>
              <strong>{currencyFormatter.format(result.investment_plan.recommended_monthly_sip)}</strong>
            </div>
            <div>
              <span>Expected annual return</span>
              <strong>{result.investment_plan.estimated_annual_return}%</strong>
            </div>
            <div>
              <span>Horizon</span>
              <strong>{result.investment_plan.horizon_years} years</strong>
            </div>
          </div>
          <p className="body-copy">{result.investment_plan.narrative}</p>
          <p className="subtle-copy">{result.investment_plan.allocation_hint}</p>
        </section>
      </div>

      <ChartComponent futureProjection={result.future_projection} />

      <div className="dashboard-grid">
        <section className="card fade-up">
          <div className="section-heading compact">
            <span className="eyebrow">Tax planning</span>
            <h3>India-specific saving ideas</h3>
          </div>
          <ul className="insight-list">
            {result.tax_suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </section>

        <section className="card fade-up">
          <div className="section-heading compact">
            <span className="eyebrow">What-if simulator</span>
            <h3>Test a different SIP amount</h3>
          </div>
          <label className="slider-label" htmlFor="sip-range">
            Monthly SIP: <strong>{currencyFormatter.format(simulatorSip)}</strong>
          </label>
          <input
            id="sip-range"
            className="slider"
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={simulatorSip}
            onChange={(event) => setSimulatorSip(Number(event.target.value))}
          />
          <div className="simulator-output">
            <span>Projected 10-year corpus</span>
            <strong>{currencyFormatter.format(projectedSimulatorValue)}</strong>
          </div>
          <p className="subtle-copy">This uses the same 12% annualized SIP formula as the backend forecast.</p>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
