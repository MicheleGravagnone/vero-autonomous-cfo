# Vero – Frontend (Autonomous CFO challenge)

React + TypeScript + Vite. Plain-language UI for business owners of every generation.

## Run

```bash
npm install
npm run dev                # mock backend, http://localhost:5173
# presenter controls: http://localhost:5173/?demo=1
```

Real backend (served at http://localhost:8000, frontend calls `/api/...`):

```bash
# Mac/Linux
VITE_MOCK=0 npm run dev
# Windows PowerShell
$env:VITE_MOCK="0"; npm run dev
# backend somewhere else:
BACKEND_URL=http://10.0.0.5:8000 VITE_MOCK=0 npm run dev
```

The dev server proxies `/api/*` → `$BACKEND_URL/*` (prefix removed), same as nginx in production,
so the backend does **not** need CORS and has no `/api` prefix in its routes.

## Screens

| Route | What it shows |
|---|---|
| `/` Today | One status sentence, 13-week cash chart (W1–W13), **Needs your OK**, **Suggestions**, **Done and checked** |
| `/contract` | The only upload. Customer contract → cash impact → safer terms → email draft. Lease → registered for Vero |
| `/costs` | Vero, the cost check: findings with a live investigation trace, evidence, prepared actions. `?doc=<id>` filters by document |
| `/activity` | Sealed (hash-chained) history of everything agents and the owner did |

Every item shows the challenge's four levels: **Checked on its own** (analysis), **Suggestion**,
**Needs your OK**, **Done for you**, plus **Simulated** vs real execution.
"How did you decide?" opens the business logic step by step.

Accessibility: Inter with tabular figures, fixed 16px base, keyboard focus, screen-reader labels,
reduced motion respected.

## Data

All shapes: `src/api/types.ts` (copy in `../docs/api-contract.ts`).

Mock mode replays **Pizzeria Amalfi's 2025 bank statement** (`../data/samples/`, imported via the `@samples` alias).
Demo date: Monday 14 April 2025; agents only see transactions before it.

- `src/api/mock/statement.ts`: CSV parser, daily balances, weekly forecast (mock forecast = 2025 actuals + approved decisions)
- `src/api/mock/index.ts`: CFO story (Cash, Currency, Tax agents), contract check, presenter events
- `src/api/mock/costs.ts`: Vero (rent notice → lease §5 → `engine.ts`)

Presenter controls (`?demo=1`): **Rent increase notice arrives**, **Fast-forward to 1 July**, **Start again**.
Upload the lease on Contract check first (demo button "Lease (Mietvertrag)") for the full rent story;
without it Vero stops at "Needs evidence" and asks for the lease.

Real-backend builds do not include the mock (it is loaded with a dynamic import only when `VITE_MOCK=1`).

## Deploy on OpenShift

The image runs nginx as **non-root on port 8080** (required by OpenShift) and forwards `/api` to the backend.

```bash
docker build -t cfo-frontend .                       # real backend
docker build -t cfo-frontend --build-arg VITE_MOCK=1   --build-context samples=../data/samples .          # self-contained demo (needs the sample CSV)
docker run -p 8080:8080 -e BACKEND_URL=http://host.docker.internal:8000 cfo-frontend
```

On the cluster: push the image, set it in `openshift/frontend.yaml`, then `oc apply -f openshift/frontend.yaml`.
Or let OpenShift build it from Git: `oc new-app https://github.com/hold-my-laptop/autonomous-cfo --context-dir=frontend --name=frontend`
and set `BACKEND_URL` on the Deployment.
