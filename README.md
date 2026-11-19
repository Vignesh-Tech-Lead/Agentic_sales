# Agentic Sales

This repository contains two layers:

1. **`.agent/`** — the SDLC/ADLC design package (requirements, architecture, 25 module specifications, database dictionary, API standards, AI governance, testing and operations). Start with [`.agent/README.md`](.agent/README.md).
2. **`frontend/`** — the React/TypeScript UI/UX implementation covering all 25 modules with a shared design system, mock data and role-aware interactions. See [`frontend/README.md`](frontend/README.md).

## Quick start (UI)

```bash
cd frontend
npm install
npm run dev
```

The dev server binds `0.0.0.0:5173` and works behind the Arena preview proxy. `npm run build` type-checks and produces a production bundle.

The UI currently uses a local state/data layer so every screen is explorable without a backend. When the Flask API is implemented, replace `frontend/src/lib/store.tsx` with API calls; the screens and component contracts remain unchanged.
