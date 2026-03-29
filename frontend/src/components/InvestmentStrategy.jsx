import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function InvestmentStrategy({ strategy }) {
  const allocationEntries = Object.entries(strategy.allocation);
  const chartData = {
    labels: allocationEntries.map(([name]) => name),
    datasets: [
      {
        data: allocationEntries.map(([, value]) => value),
        backgroundColor: ["#1bbf8a", "#3cc3ff"],
        borderColor: "rgba(7, 17, 31, 0.9)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#d7dcef",
        },
      },
    },
  };

  return (
    <section className="card dashboard-strategy fade-up">
      <div className="section-heading compact">
        <span className="eyebrow">Recommended investment strategy</span>
        <h3>Allocation and instrument mix</h3>
        <p>{strategy.reasoning}</p>
      </div>

      <div className="strategy-layout">
        <div className="strategy-chart-panel">
          <div className="strategy-chart-wrap">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className="strategy-allocation-grid">
            {allocationEntries.map(([name, value]) => (
              <article className="goal-stat-card" key={name}>
                <span>{name}</span>
                <strong>{value}%</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="strategy-recommendations-grid">
          {strategy.recommendations.map((item) => (
            <article className="strategy-recommendation-card" key={item.name}>
              <div className="strategy-recommendation-header">
                <h4>{item.name}</h4>
                <span>{item.type}</span>
              </div>
              <p className="subtle-copy">Risk: {item.risk_level}</p>
              <p className="body-copy">Expected return range: {item.expected_return_range}</p>
              {item.market_data ? (
                <div className="market-chip-row">
                  <span className="market-chip">{item.market_data.symbol}</span>
                  <span className="market-chip">Price: {currencyFormatter.format(item.market_data.current_price || 0)}</span>
                  <span className="market-chip">1Y: {item.market_data.one_year_return_pct ?? "N/A"}%</span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <p className="disclaimer-text">{strategy.disclaimer}</p>
    </section>
  );
}

export default InvestmentStrategy;
