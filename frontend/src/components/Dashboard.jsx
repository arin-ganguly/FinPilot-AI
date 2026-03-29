import { useState } from "react";

import ChartComponent from "./ChartComponent";
import GoalPlanner from "./GoalPlanner";
import InfoTip from "./InfoTip";
import InvestmentStrategy from "./InvestmentStrategy";
import financeGlossary from "../constants/financeGlossary";

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
  const emergencyMonths = Number(result.score_breakdown.emergency_fund.value || 0).toFixed(1);
  const expenseRatio = Number(result.score_breakdown.expense_ratio.value || 0).toFixed(0);
  const savingsRatio = Number(result.score_breakdown.savings_ratio.value || 0).toFixed(0);

  return (
    <div className="dashboard-board">
      <section className="card dashboard-hero fade-up">
        <div>
          <span className="eyebrow">Decision engine output</span>
          <h1>Your financial dashboard</h1>
          <p>
            Age {inputs.age}, monthly income {currencyFormatter.format(inputs.income)}, expenses {currencyFormatter.format(result.expense_breakdown.total_expenses)}, and a {inputs.risk_appetite} risk profile.
          </p>
        </div>

        <div className="dashboard-pill-row">
          <article className="summary-pill compact-pill">
            <span>Money health</span>
            <strong>{result.health_score}/100</strong>
          </article>
          <article className="summary-pill compact-pill">
            <div className="label-with-tip">
              <span>Monthly surplus</span>
              <InfoTip text={financeGlossary.surplus} />
            </div>
            <strong>{currencyFormatter.format(result.score_breakdown.monthly_surplus)}</strong>
          </article>
          <article className="summary-pill compact-pill">
            <div className="label-with-tip">
              <span>Recommended SIP</span>
              <InfoTip text={financeGlossary.sip} />
            </div>
            <strong>{currencyFormatter.format(result.investment_plan.recommended_monthly_sip)}</strong>
          </article>
          <article className="summary-pill compact-pill">
            <div className="label-with-tip">
              <span>Projected corpus</span>
              <InfoTip text={financeGlossary.corpus} />
            </div>
            <strong>{currencyFormatter.format(result.investment_plan.projected_corpus)}</strong>
          </article>
        </div>
      </section>

      <section className="card dashboard-score fade-up">
        <div className="mini-score-ring" style={{ "--score": `${result.health_score}%` }}>
          <div>
            <span className="score-label">Money health</span>
            <strong>{result.health_score}</strong>
            <p>/ 100</p>
          </div>
        </div>

        <div className="score-summary-grid">
          <article className="metric-item compact-metric">
            <div className="metric-header">
              <h4>Savings ratio</h4>
              <span>{result.score_breakdown.savings_ratio.score}/40</span>
            </div>
            <strong>{savingsRatio}%</strong>
            <small>{result.score_breakdown.savings_ratio.benchmark}</small>
          </article>
          <article className="metric-item compact-metric">
            <div className="metric-header">
              <h4>Emergency fund</h4>
              <span>{result.score_breakdown.emergency_fund.score}/30</span>
            </div>
            <strong>{emergencyMonths} months</strong>
            <small>{result.score_breakdown.emergency_fund.benchmark}</small>
          </article>
          <article className="metric-item compact-metric">
            <div className="metric-header">
              <h4>Expense ratio</h4>
              <span>{result.score_breakdown.expense_ratio.score}/30</span>
            </div>
            <strong>{expenseRatio}%</strong>
            <small>{result.score_breakdown.expense_ratio.benchmark}</small>
          </article>
        </div>

        <p className="subtle-copy">{result.score_breakdown.summary}</p>
      </section>

      <section className="card dashboard-plan fade-up">
        <div className="section-heading compact">
          <span className="eyebrow">Plan</span>
          <h3>Recommended next moves</h3>
        </div>
        <div className="data-stack compact-stack">
          <div>
            <span>Annual return assumption</span>
            <strong>{result.investment_plan.estimated_annual_return}%</strong>
          </div>
          <div>
            <span>Horizon</span>
            <strong>{result.investment_plan.horizon_years} years</strong>
          </div>
          <div>
            <span>Total expenses</span>
            <strong>{currencyFormatter.format(result.expense_breakdown.total_expenses)}</strong>
          </div>
        </div>
        <p className="body-copy">{result.ai_advice}</p>
        <p className="subtle-copy">{result.investment_plan.narrative}</p>
        <p className="subtle-copy">{result.investment_plan.allocation_hint}</p>
      </section>

      <div className="dashboard-strategy-zone fade-up">
        <InvestmentStrategy strategy={result.investment_strategy} />
      </div>

      <div className="dashboard-chart-zone fade-up">
        <ChartComponent futureProjection={result.future_projection} />
      </div>

      <section className="card dashboard-expenses fade-up">
        <div className="section-heading compact">
          <span className="eyebrow">Expense snapshot</span>
          <h3>Quick understanding</h3>
        </div>
        <div className="expense-summary-grid">
          <article className="goal-stat-card">
            <span>Total monthly expenses</span>
            <strong>{currencyFormatter.format(result.expense_breakdown.total_expenses)}</strong>
          </article>
          <article className="goal-stat-card">
            <span>Savings ratio</span>
            <strong>{savingsRatio}%</strong>
          </article>
          <article className="goal-stat-card">
            <span>Emergency runway</span>
            <strong>{emergencyMonths} months</strong>
          </article>
        </div>
      </section>

      <section className="card dashboard-tax fade-up">
        <div className="section-heading compact">
          <span className="eyebrow">Tax planning</span>
          <h3>India-specific saving ideas</h3>
        </div>
        <div className="glossary-chip-row">
          <div className="glossary-chip">
            <span>80C</span>
            <InfoTip text={financeGlossary.section80c} />
          </div>
          <div className="glossary-chip">
            <span>ELSS</span>
            <InfoTip text={financeGlossary.elss} />
          </div>
          <div className="glossary-chip">
            <span>PPF</span>
            <InfoTip text={financeGlossary.ppf} />
          </div>
        </div>
        <ul className="insight-list compact-list">
          {result.tax_suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </section>

      <div className="dashboard-goals-zone fade-up">
        <GoalPlanner currentSip={result.investment_plan.recommended_monthly_sip} monthlySurplus={result.score_breakdown.monthly_surplus} />
      </div>

      <section className="card dashboard-simulator fade-up">
        <div className="section-heading compact">
          <span className="eyebrow">What-if simulator</span>
          <h3>Test a different SIP</h3>
        </div>
        <label className="slider-label" htmlFor="sip-range">
          <span className="label-with-tip">
            <span>Monthly SIP</span>
            <InfoTip text={financeGlossary.sip} />
          </span>
          <strong>{currencyFormatter.format(simulatorSip)}</strong>
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
          <div className="label-with-tip">
            <span>Projected 10-year corpus</span>
            <InfoTip text={financeGlossary.corpus} />
          </div>
          <strong>{currencyFormatter.format(projectedSimulatorValue)}</strong>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
