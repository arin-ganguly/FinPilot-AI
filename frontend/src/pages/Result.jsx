import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import ChatAssistant from "../components/ChatAssistant";
import Dashboard from "../components/Dashboard";
import ReportDocument from "../components/ReportDocument";

function Result() {
  const { state } = useLocation();
  const [downloading, setDownloading] = useState(false);

  if (!state?.inputs || !state?.result) {
    return <Navigate to="/" replace />;
  }

  const financialData = {
    ...state.inputs,
    health_score: state.result.health_score,
    current_sip: state.result.investment_plan.recommended_monthly_sip,
  };

  const handleDownloadReport = async () => {
    const reportContent = document.getElementById("pdf-report-content");
    if (!reportContent) {
      return;
    }

    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const canvas = await html2canvas(reportContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: reportContent.scrollWidth,
        height: reportContent.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      pdf.save(`finpilot-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="page-shell result-shell">
      <div className="ambient ambient-three" />
      <div className="ambient ambient-four" />

      <div className="result-actions fade-up">
        <Link className="ghost-button" to="/">
          Run another analysis
        </Link>
        <button className="ghost-button" type="button" onClick={handleDownloadReport} disabled={downloading}>
          {downloading ? "Preparing PDF..." : "Download Report"}
        </button>
      </div>

      <Dashboard inputs={state.inputs} result={state.result} />
      <ChatAssistant financialData={financialData} />

      <div className="pdf-report-host" aria-hidden="true">
        <div id="pdf-report-content">
          <ReportDocument inputs={state.inputs} result={state.result} />
        </div>
      </div>
    </main>
  );
}

export default Result;
