function ReportDocument({ inputs, result }) {
  const allocationEntries = Object.entries(result.investment_strategy.allocation);

  return (
    <div className="pdf-report-shell">
      <header className="pdf-report-header">
        <div>
          <p className="pdf-eyebrow">FinPilot AI</p>
          <h1>Personal Financial Report</h1>
          <p>
            Age {inputs.age}, monthly income INR {inputs.income.toLocaleString("en-IN")}, expenses INR {result.expense_breakdown.total_expenses.toLocaleString("en-IN")}, savings INR {inputs.savings.toLocaleString("en-IN")}, risk profile {inputs.risk_appetite}.
          </p>
        </div>
        <div className="pdf-score-box">
          <span>Money health</span>
          <strong>{result.health_score}/100</strong>
        </div>
      </header>

      <section className="pdf-section">
        <h2>Key Metrics</h2>
        <div className="pdf-grid three">
          <article className="pdf-card">
            <span>Monthly surplus</span>
            <strong>INR {result.score_breakdown.monthly_surplus.toLocaleString("en-IN")}</strong>
          </article>
          <article className="pdf-card">
            <span>Recommended SIP</span>
            <strong>INR {result.investment_plan.recommended_monthly_sip.toLocaleString("en-IN")}</strong>
          </article>
          <article className="pdf-card">
            <span>Projected corpus</span>
            <strong>INR {result.investment_plan.projected_corpus.toLocaleString("en-IN")}</strong>
          </article>
        </div>
      </section>

      <section className="pdf-section">
        <h2>AI Advice</h2>
        <p>{result.ai_advice}</p>
      </section>

      <section className="pdf-section">
        <h2>Investment Strategy</h2>
        <div className="pdf-grid two">
          <div className="pdf-card">
            <h3>Asset allocation</h3>
            <ul>
              {allocationEntries.map(([name, value]) => (
                <li key={name}>{name}: {value}%</li>
              ))}
            </ul>
          </div>
          <div className="pdf-card">
            <h3>Reasoning</h3>
            <p>{result.investment_strategy.reasoning}</p>
            <small>{result.investment_strategy.disclaimer}</small>
          </div>
        </div>
        <div className="pdf-grid two top-gap">
          {result.investment_strategy.recommendations.map((item) => (
            <article className="pdf-card" key={item.name}>
              <h3>{item.name}</h3>
              <p>Type: {item.type}</p>
              <p>Risk level: {item.risk_level}</p>
              <p>Expected return: {item.expected_return_range}</p>
              {item.market_data ? <p>Market data: {item.market_data.symbol}, 1Y return {item.market_data.one_year_return_pct ?? "N/A"}%</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="pdf-section">
        <h2>Tax Suggestions</h2>
        <ul>
          {result.tax_suggestions.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ReportDocument;
