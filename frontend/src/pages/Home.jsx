import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "../components/Form";
import { analyzeFinancialProfile } from "../services/api";

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  if (error?.code === "ECONNABORTED") {
    return "The analysis is taking longer than expected. Ollama is probably still generating locally. Please wait and try again, or use a smaller/faster local model.";
  }

  if (error?.message === "Network Error") {
    return "Cannot reach the FastAPI backend at http://localhost:8000. Please make sure the backend server is running.";
  }

  return error?.message || "Unable to complete the analysis right now. Please verify the backend is running and try again.";
}

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const result = await analyzeFinancialProfile(values);
      navigate("/result", {
        state: {
          inputs: values,
          result,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell home-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero-panel">
        <div className="hero-copy fade-up">
          <span className="eyebrow">FinPilot AI</span>
          <h1>Personal financial decisions, scored and stress-tested in minutes.</h1>
          <p>
            Turn your income, expenses, savings, and risk profile into a money health score, AI advice,
            tax-saving ideas, and a 10-year SIP projection designed for Indian users.
          </p>

          <div className="feature-strip">
            <article className="mini-card">
              <strong>0-100</strong>
              <span>Money health score with clear drivers</span>
            </article>
            <article className="mini-card">
              <strong>10-year</strong>
              <span>Wealth projection with yearly growth tracking</span>
            </article>
            <article className="mini-card">
              <strong>80C / 80D</strong>
              <span>India-specific tax planning suggestions</span>
            </article>
          </div>
        </div>

        <Form onSubmit={handleSubmit} loading={loading} error={error} />
      </section>
    </main>
  );
}

export default Home;
