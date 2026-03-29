const formatPercent = (value) => `${Math.round(value)}%`;

function ScoreCard({ healthScore, scoreBreakdown }) {
  const metrics = [
    {
      key: "Savings ratio",
      value: formatPercent(scoreBreakdown.savings_ratio.value),
      score: `${scoreBreakdown.savings_ratio.score}/${scoreBreakdown.savings_ratio.weight}`,
      benchmark: scoreBreakdown.savings_ratio.benchmark,
      explanation: scoreBreakdown.savings_ratio.explanation,
    },
    {
      key: "Emergency fund",
      value: `${scoreBreakdown.emergency_fund.value.toFixed(1)} months`,
      score: `${scoreBreakdown.emergency_fund.score}/${scoreBreakdown.emergency_fund.weight}`,
      benchmark: scoreBreakdown.emergency_fund.benchmark,
      explanation: scoreBreakdown.emergency_fund.explanation,
    },
    {
      key: "Expense ratio",
      value: formatPercent(scoreBreakdown.expense_ratio.value),
      score: `${scoreBreakdown.expense_ratio.score}/${scoreBreakdown.expense_ratio.weight}`,
      benchmark: scoreBreakdown.expense_ratio.benchmark,
      explanation: scoreBreakdown.expense_ratio.explanation,
    },
  ];

  return (
    <section className="card score-card fade-up">
      <div className="score-ring" style={{ "--score": `${healthScore}%` }}>
        <div>
          <span className="score-label">Money health</span>
          <strong>{healthScore}</strong>
          <p>/ 100</p>
        </div>
      </div>

      <div className="score-details">
        <div>
          <span className="eyebrow">Score summary</span>
          <h3>How your score was built</h3>
          <p>{scoreBreakdown.summary}</p>
        </div>

        <div className="metric-list">
          {metrics.map((metric) => (
            <article className="metric-item" key={metric.key}>
              <div className="metric-header">
                <h4>{metric.key}</h4>
                <span>{metric.score}</span>
              </div>
              <strong>{metric.value}</strong>
              <p>{metric.benchmark}</p>
              <small>{metric.explanation}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScoreCard;
