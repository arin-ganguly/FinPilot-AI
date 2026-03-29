import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ChartComponent({ futureProjection }) {
  const data = {
    labels: futureProjection.map((point) => `Year ${point.year}`),
    datasets: [
      {
        label: "Projected corpus",
        data: futureProjection.map((point) => point.projected_value),
        borderColor: "#1bbf8a",
        backgroundColor: "rgba(27, 191, 138, 0.18)",
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#f8f7ef",
        pointBorderColor: "#1bbf8a",
        tension: 0.35,
        fill: true,
      },
      {
        label: "Capital invested",
        data: futureProjection.map((point) => point.invested_amount),
        borderColor: "#8f98af",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#d7d8df",
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${currencyFormatter.format(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(143, 152, 175, 0.12)",
        },
        ticks: {
          color: "#c9ccda",
        },
      },
      y: {
        grid: {
          color: "rgba(143, 152, 175, 0.12)",
        },
        ticks: {
          color: "#c9ccda",
          callback(value) {
            return currencyFormatter.format(value);
          },
        },
      },
    },
  };

  return (
    <section className="card chart-card fade-up">
      <div className="section-heading compact">
        <span className="eyebrow">Wealth outlook</span>
        <h3>10-year corpus projection</h3>
      </div>
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}

export default ChartComponent;
