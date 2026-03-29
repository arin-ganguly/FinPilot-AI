import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#1bbf8a", "#3cc3ff", "#ffc96b", "#ff8f70", "#9f8cff", "#8f98af"];

function ExpensePieChart({ expenseBreakdown }) {
  const categories = expenseBreakdown.categories.filter((item) => item.amount > 0);
  const labels = categories.length > 0 ? categories.map((item) => item.category) : ["Uncategorized"];
  const dataPoints = categories.length > 0 ? categories.map((item) => item.amount) : [expenseBreakdown.total_expenses];

  const data = {
    labels,
    datasets: [
      {
        data: dataPoints,
        backgroundColor: COLORS.slice(0, labels.length),
        borderColor: "rgba(7, 17, 31, 0.9)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = Number(context.parsed || 0);
            const total = expenseBreakdown.total_expenses || 1;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: INR ${value.toLocaleString("en-IN")} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="expense-chart-wrap">
      <Pie data={data} options={options} />
    </div>
  );
}

export default ExpensePieChart;
