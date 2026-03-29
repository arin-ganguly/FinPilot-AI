import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function analyzeFinancialProfile(payload) {
  const { data } = await api.post("/analyze", payload);
  return data;
}

export default api;
