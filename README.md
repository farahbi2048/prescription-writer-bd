# Prescription Writer BD

A React/Vite prescription workflow with authenticated FastAPI services and an AI-assisted clinician review workspace.

## Portfolio demo

Select **Try portfolio demo** to explore synthetic patients, prescriptions, appointments, payments, calculators, and print layouts immediately. Demo mode never requires the backend and never sends its synthetic records to the API.

Live AI processing is protected behind authentication to prevent public misuse of the configured Gemini key. Never upload real patient recordings or identifying information to a public portfolio deployment.

## Local frontend

1. Copy `.env.example` to `.env.local`.
2. Run `npm install`.
3. Run `npm run dev`.

## Local backend

1. Copy `backend/.env.example` to `backend/.env` and add a Gemini API key and random JWT secret.
2. Install `backend/requirements.txt` in a virtual environment.
3. From `backend`, run `uvicorn main:app --reload`.

## Deployment

- Import the repository into Vercel for the Vite frontend.
- Create a Render Blueprint from the root `render.yaml` for the FastAPI backend.
- In Render, provide `GEMINI_API_KEY` and a long random `JWT_SECRET_KEY`.
- In Vercel, set `VITE_API_BASE_URL` and `VITE_MEDSCRIBE_API_URL` to the Render service URL, and set `VITE_DEMO_MODE=true`.
- Redeploy Vercel after changing environment variables.

The Render free service can sleep while idle. The frontend loads synthetic portfolio data immediately and shows the backend wake status without blocking the demo.
