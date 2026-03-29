# FinPilot AI - Personal Financial Decision Engine

FinPilot AI is a full-stack financial advisor web app that combines deterministic finance calculations with AI-generated guidance for Indian users. The project uses a FastAPI backend, a React + Vite frontend, SQLite for persistence, and a local Ollama model for personalized advice without any cloud API key.

## Features

- Money Health Score from 0 to 100 with a transparent score breakdown
- Personalized AI financial advice for Indian users
- SIP recommendation with 10-year future wealth projection
- India-specific tax-saving suggestions covering 80C, 80D, ELSS, PPF, and NPS
- SQLite persistence for submitted analyses
- Responsive fintech-style dashboard with loading states and chart visualizations
- Built-in what-if SIP simulator on the results page
- Graceful fallback advice when Ollama is not running

## Tech Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- Local Ollama API

### Frontend

- React.js with Vite
- Axios
- Chart.js with react-chartjs-2
- React Router

## Project Structure

```text
backend/
  app/
    main.py
    routes/
      analyze.py
    services/
      ai_engine.py
      calculator.py
      scoring.py
    models/
      user_model.py
    database/
      db.py
    schemas/
      user_schema.py
  requirements.txt
  .env.example

frontend/
  src/
    components/
      Form.jsx
      Dashboard.jsx
      ScoreCard.jsx
      ChartComponent.jsx
    pages/
      Home.jsx
      Result.jsx
    services/
      api.js
    App.jsx
    main.jsx
    styles.css
  package.json
  vite.config.js
  .env.example
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env` if needed:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_SECONDS=90
DATABASE_URL=sqlite:///./finpilot.db
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Ollama Setup

1. Install Ollama from the official website.
2. Start Ollama.
3. Pull a local model:

```bash
ollama pull llama3.2:3b
```

4. Keep the Ollama server running locally. By default it serves at `http://localhost:11434`.

You can replace `llama3.2:3b` with another local model if you prefer, then update `OLLAMA_MODEL` in `backend/.env`.
A smaller model can respond faster on CPU-only systems.

Run the API server:

```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend environment file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The frontend will run at `http://localhost:5173`.

## API Contract

### POST `/analyze`

Request body:

```json
{
  "age": 30,
  "income": 100000,
  "expenses": 55000,
  "savings": 400000,
  "risk_appetite": "moderate"
}
```

Response body includes:

- `health_score`
- `score_breakdown`
- `investment_plan`
- `tax_suggestions`
- `future_projection`
- `ai_advice`

Example request:

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"age":30,"income":100000,"expenses":55000,"savings":400000,"risk_appetite":"moderate"}'
```

## Financial Logic

- SIP future value uses the monthly compounding formula with a default 12% annual return over 10 years.
- Health score weighting:
  - Savings ratio: 40%
  - Emergency fund adequacy: 30%
  - Expense ratio: 30%

## Notes

- The first Ollama request can be noticeably slower because the model may need to load into memory.
- If Ollama is not running or the local model is unavailable, the backend returns practical fallback advice so the app still works locally.
- SQLite data is stored in `backend/finpilot.db`.
- The what-if simulator on the results page uses the same SIP formula client-side for instant exploration.

## Run Order

1. Start Ollama and ensure your chosen model is pulled.
2. Start the backend from the `backend` folder.
3. Start the frontend from the `frontend` folder.
4. Open `http://localhost:5173` and submit the form.
