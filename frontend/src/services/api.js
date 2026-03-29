import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function analyzeFinancialProfile(payload) {
  const { data } = await api.post("/analyze", payload);
  return data;
}

export async function createGoalPlan(payload) {
  const { data } = await api.post("/goal-plan", payload);
  return data;
}

export async function sendChatMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}

export default api;
