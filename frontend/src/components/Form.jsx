import { useState } from "react";

const initialState = {
  age: 28,
  income: 90000,
  expenses: 45000,
  savings: 300000,
  risk_appetite: "moderate",
};

function Form({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "risk_appetite" ? value : value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      age: Number(formData.age),
      income: Number(formData.income),
      expenses: Number(formData.expenses),
      savings: Number(formData.savings),
      expense_breakdown: null,
    });
  };

  return (
    <div className="card form-card fade-up">
      <div className="section-heading">
        <span className="eyebrow">Personal financial snapshot</span>
        <h2>Run your AI-backed money analysis</h2>
        <p>Share four simple numbers to generate a score, investment plan, tax ideas, and a 10-year wealth view.</p>
      </div>

      <form className="analysis-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            <span>Age</span>
            <input type="number" name="age" min="18" max="100" value={formData.age} onChange={handleChange} required />
          </label>

          <label>
            <span>Monthly income</span>
            <input type="number" name="income" min="1" step="1000" value={formData.income} onChange={handleChange} required />
          </label>

          <label>
            <span>Monthly expenses</span>
            <input type="number" name="expenses" min="0" step="1000" value={formData.expenses} onChange={handleChange} required />
          </label>

          <label>
            <span>Current savings</span>
            <input type="number" name="savings" min="0" step="1000" value={formData.savings} onChange={handleChange} required />
          </label>

          <label className="form-grid-wide">
            <span>Risk appetite</span>
            <select name="risk_appetite" value={formData.risk_appetite} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        {error ? <div className="status-banner error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? (
            <span className="button-loading">
              <span className="button-spinner" />
              Analyzing finances...
            </span>
          ) : (
            "Generate plan"
          )}
        </button>
      </form>
    </div>
  );
}

export default Form;
