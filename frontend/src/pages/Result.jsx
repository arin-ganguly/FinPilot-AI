import { Link, Navigate, useLocation } from "react-router-dom";

import Dashboard from "../components/Dashboard";

function Result() {
  const { state } = useLocation();

  if (!state?.inputs || !state?.result) {
    return <Navigate to="/" replace />;
  }

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
    </main>
  );
}

export default Result;
