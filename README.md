# Prescription Writer BD

A student portfolio project for drafting prescriptions and exploring a clinic's daily workflow. The frontend uses React and TypeScript. A FastAPI backend handles account registration, login and patient API requests.

## What works now

- Register a doctor account, sign in and restore the session after a page refresh.
- Load demo patients, edit their details and save those fields in the browser.
- Search the bundled medicine list and build a medication list for the current prescription.
- Preview and print a prescription, with or without the clinic header.
- Create local appointments and demo payment records.
- Change header details, colours and page-preview dimensions.

SMS sending and credit purchases are simulations. They update local UI state without contacting a carrier or payment provider.

## Where the data goes

Authentication uses the backend. Passwords are hashed with bcrypt, and login returns a JWT access token. The frontend stores that token in `localStorage` and checks it through `/api/auth/me` when the app opens.

The prescription workspace has separate storage. Patient fields, appointments, payment records, header settings and page settings are saved under `bd_prescription_*` keys in the browser. These records are not synced to the patient API or separated by doctor account in browser storage.

The backend uses SQLAlchemy with SQLite by default. Starting it from `backend/` creates `backend/database.db`. The database has tables for users, patients, prescriptions, AI sessions and audit logs. Only authentication and patient routes are currently registered. Patient changes through the API create audit entries; browser-only changes do not.

The current medication list lives in React state. Saving a prescription saves the patient fields and adds a demo payment, but does not save the medication list. Loading a saved patient replaces the list with sample medicines.

## Files to start with

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Workspace state, patient editing, appointments, payments and prescription rendering |
| `src/context/AuthContext.tsx` | Login, registration, token storage and session checks |
| `src/components/AuthGateway.tsx` | Login and registration forms |
| `src/components/AiScribe.tsx` | Audio upload, editable SOAP draft and patient handoff |
| `src/components/Calculators.tsx` | BMI, insulin split, growth placeholder, calorie and delivery-date calculations |
| `src/components/PageLayoutSimulator.tsx` | Dimension inputs and the scaled pad preview |
| `src/data.ts` | Demo records, medicine list and default settings |
| `src/types.ts` | Frontend data types |
| `src/index.css` | Fonts and print rules |
| `backend/app/main.py` | API setup, CORS and registered routers |
| `backend/app/routers/` | Authentication and patient endpoints |
| `backend/app/models.py` | SQLAlchemy table definitions |
| `backend/app/schemas.py` | Request and response models |
| `backend/app/security.py` | Password hashing and JWT creation |
| `backend/app/dependencies.py` | Token validation and current-user lookup |
| `backend/app/database.py` | Database engine and request sessions |
| `backend/app/config.py` | Backend environment settings |
| `backend/main.py` | Entry point for the Uvicorn command below |
| `backend/models.py` | Earlier audio-analysis response models |
| `.github/workflows/deploy.yml` | Frontend deployment to GitHub Pages |

## Running locally

Use Node.js 20 or newer and Python 3.10 or newer. Run the backend and frontend in separate terminals.

From the repository root, set up the backend in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

If PowerShell blocks activation, allow local scripts for that terminal and try activation again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

For first-time setup, copy `backend/.env.example` to `backend/.env`. Skip this command if you already have a configured file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set a long, random `JWT_SECRET_KEY` in `backend/.env`. Keep it and any API keys out of Git. The current authentication and patient routes do not use the Gemini key.

Start the API:

```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```

Check `http://127.0.0.1:8000/health` or open the API docs at `http://127.0.0.1:8000/docs`.

In a second terminal, from the repository root:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` and register an account. Registration is followed by login automatically. Later visits can use the same email and password.

The auth API address defaults to `http://127.0.0.1:8000`. Set `VITE_API_BASE_URL` in a root `.env.local` if the backend is elsewhere, then restart Vite. The backend's `CORS_ORIGINS` must include the frontend origin.

Other commands:

```powershell
npm run lint     # TypeScript check
npm run build    # Build the frontend into dist/
npm run preview  # Serve the built frontend locally
```

## AI Scribe

The review screen is implemented, but the current FastAPI app does not register `POST /api/visit-audio`. Starting this backend alone will not make audio processing work. The Gemini and OpenFDA integration still needs to be restored in the authenticated backend.

The frontend expects a SOAP note, medicine-label lookup results and a disclaimer from that endpoint. Its API address comes from `VITE_MEDSCRIBE_API_URL`, defaulting to `http://localhost:8000`.

Once the endpoint is available, the review flow is:

1. Load the intended patient from **Saved Patients & History**.
2. Open **AI Scribe** and upload a fictional visit recording.
3. Review and edit the returned SOAP fields.
4. Select **Apply reviewed draft & open prescription**.
5. Review the patient record and save the visit.

The handoff replaces chief complaints, present history and diagnosis with the reviewed values. It appends objective findings and the plan to the patient's notes. Medicine names mentioned in the recording are not added to the prescription automatically.

Present history and notes are stored with the patient, but the current pad does not render them. Applying a draft does not save it automatically, and leaving the AI Scribe screen discards its local review state.

AI output is a draft requiring clinician review. The medicine index and label lookups are informational; they do not provide medical advice or prescribing recommendations.

## Implementation notes

- The BMI weight range uses BMI bounds of 18.5 and 24.9. The existing UI label calling it a Devine calculation needs correction.
- The growth tab uses placeholder weight bands, not a WHO Z-score calculation. Its UI labels still need correction.
- The growth and gestational-age calculations use the fixed date `2026-05-19`.
- Selecting a medicine can fill demo dose presets based on drug class. These are not validated prescribing rules.
- The pad designer is a scaled preview. Several saved dimension and print preferences are not applied to the final print layout.
- Printing uses `window.print()` and A4 CSS. There is no direct ESC/POS printer integration, despite the current button label.
- The barcode is decorative and does not encode patient details.
- The revisit fee is chosen whenever the registration number already appears in the local patient list. Every save adds another demo payment.
- Browser storage is not an offline application cache or a database synchronizer.

## Deployment

The GitHub Actions workflow builds the frontend on pushes to `main`, or when run manually. In the repository's **Settings → Pages**, select **GitHub Actions** as the deployment source.

GitHub Pages hosts only the frontend. A deployed login screen needs a separately hosted API, a reachable `VITE_API_BASE_URL` set at build time, and matching backend CORS settings.

## Demo data and remaining work

All preloaded patient, contact, appointment, payment and clinician records are fictional. Any resemblance to real people or organizations is coincidental. Use fictional data and recordings when demonstrating the app.

This is not a production clinical system. Calculator results and prescription content have not been clinically validated. Check medicine information against authoritative sources before clinical use.

The next development work is to connect workspace records to the protected API, persist prescriptions and medications, restore the audio route, add database migrations and resolve the limitations listed above.

Production deployment would also require managed PostgreSQL or a suitable managed relational database, stronger role-based access, encryption in transit and at rest, comprehensive audit logging, automated tests, backups, monitoring, clinical validation and applicable privacy and regulatory review.
