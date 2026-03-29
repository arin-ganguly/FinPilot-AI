import { Link, Navigate, useLocation } from "react-router-dom";

import ChatAssistant from "../components/ChatAssistant";
import Dashboard from "../components/Dashboard";

function Result() {
  const { state } = useLocation();

  if (!state?.inputs || !state?.result) {
    return <Navigate to="/" replace />;
  }

  const financialData = {
    ...state.inputs,
    health_score: state.result.health_score,
    current_sip: state.result.investment_plan.recommended_monthly_sip,
  };

  return (
    <main className="page-shell result-shell">
      <div className="ambient ambient-three" />
      <div className="ambient ambient-four" />

      <div className="result-actions fade-up">
        <Link className="ghost-button" to="/">
          Run another analysis
        </Link>
      </div>

      <Dashboard inputs={state.inputs} result={state.result} />
      <ChatAssistant financialData={financialData} />
    </main>
  );
}

export default Result;
