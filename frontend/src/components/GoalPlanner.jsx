import { useState } from "react";

import { createGoalPlan } from "../services/api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const initialGoal = {
  goal_name: "Dream home down payment",
  target_amount: 2500000,
  years: 5,
};

function getStatusClass(status) {
  if (status === "On Track") {
    return "status-chip success";
  }
  if (status === "Reachable with a higher SIP") {
    return "status-chip warning";
  }
  return "status-chip danger";
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }
  return "Unable to create the goal plan right now.";
}

function GoalPlanner({ currentSip, monthlySurplus }) {
  const [goal, setGoal] = useState(initialGoal);
  const [goalResult, setGoalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const progress = goalResult?.required_sip ? Math.min((goalResult.current_sip / goalResult.required_sip) * 100, 100) : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGoal((current) => ({
      ...current,
      [name]: name === "goal_name" ? value : Number(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await createGoalPlan({
        ...goal,
        current_sip: currentSip,
        monthly_surplus: monthlySurplus,
      });
      setGoalResult(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card fade-up goal-card">
      <div className="section-heading compact">
        <span className="eyebrow">Financial goals</span>
        <h3>Plan a target with your current SIP</h3>
        <p>Estimate the SIP needed for a goal and compare it with your current recommendation from the analysis.</p>
      </div>

      <form className="goal-form" onSubmit={handleSubmit}>
        <div className="goal-form-grid">
          <label>
            <span>Goal name</span>
            <input type="text" name="goal_name" value={goal.goal_name} onChange={handleChange} required />
          </label>
          <label>
            <span>Target amount</span>
            <input type="number" name="target_amount" min="1" step="10000" value={goal.target_amount} onChange={handleChange} required />
          </label>
          <label>
            <span>Years to goal</span>
            <input type="number" name="years" min="1" max="40" value={goal.years} onChange={handleChange} required />
          </label>
        </div>

        {error ? <div className="status-banner error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Calculating goal..." : "Create goal plan"}
        </button>
      </form>

      {goalResult ? (
        <div className="goal-results">
          <div className="goal-compare-grid">
            <article className="goal-stat-card">
              <span>Required SIP</span>
              <strong>{currencyFormatter.format(goalResult.required_sip)}</strong>
            </article>
            <article className="goal-stat-card">
              <span>Current SIP</span>
              <strong>{currencyFormatter.format(goalResult.current_sip)}</strong>
            </article>
            <article className="goal-stat-card">
              <span>Gap to close</span>
              <strong>{currencyFormatter.format(goalResult.gap)}</strong>
            </article>
          </div>

          <div className="goal-progress-block">
            <div className="goal-progress-header">
              <span>{goalResult.goal_name}</span>
              <span>{progress.toFixed(0)}% of required SIP already covered</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="goal-footer">
              <span className={getStatusClass(goalResult.feasibility_status)}>{goalResult.feasibility_status}</span>
              <small>Monthly surplus currently available: {currencyFormatter.format(monthlySurplus)}</small>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default GoalPlanner;
