# Restful-Booker App

React + TypeScript (Vite) front end for the [Restful-Booker API](https://restful-booker.herokuapp.com/apidoc/index.html): browse, search, create, edit and delete bookings. Includes Playwright component tests.

## Prerequisites

- Node.js 18 or newer
- Internet access (the app calls the public Restful-Booker API; the component tests don't need it)

## Setup (once)

```bash
npm install
npx playwright install chromium
```

The second command downloads the browser that the component tests use.

## Run the app

```bash
npm run dev
```

Open **http://localhost:5173**. Log in with `admin` / `password123` to enable edit and delete.

## Run the component tests

```bash
npm run test:ct          # run all tests in the terminal
npm run test:ct:ui       # interactive UI mode
npx playwright test -c playwright-ct.config.ts --headed   # watch the tests in a real browser window
npx playwright show-report   # open the HTML report of the last run
```

Tip: add `--workers=1` to the `--headed` command to run one test at a time, which is easier to follow.

You do **not** need to start the app first. Playwright starts its own dev server on port 3100 (change `ctPort` in `playwright-ct.config.ts` if it is taken).

Tests live in `tests/component`, next to `src`:

| Spec | Covers |
| --- | --- |
| `BookingCard.spec.tsx` | Display (name, id, dates, nights, price, deposit badge, needs), Edit / Delete visibility by permission, edit callback, delete confirm and cancel |

## Other scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the build (no API proxy, so use `dev` for live data) |
| `npm run typecheck` | Type-check only |

## Components

| Component | Purpose | Endpoint |
| --- | --- | --- |
| `HealthStatus` | API online indicator | `GET /ping` |
| `LoginForm` | Admin login | `POST /auth` |
| `BookingFilters` | Search by name and dates | `GET /booking` |
| `BookingList` | List with loading, error and empty states | `GET /booking/:id` |
| `BookingCard` | One booking, edit and confirmed delete | `PUT` / `DELETE /booking/:id` |
| `BookingForm` | Create or edit with validation | `POST /booking` |
| `Notification` | Success and error messages | n/a |

## Structure

```
src/
├── App.tsx        # wires everything together
├── api/           # typed client (createApiClient) and types
├── components/    # UI components
├── hooks/         # useBookings, useAuth, useHealth
└── utils/         # validation and formatting
tests/
└── component/     # Playwright component tests
playwright/        # component test page setup (loads app styles)
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `playwright is not recognized` | Run `npm install` (delete `node_modules` first if it persists) |
| "Executable doesn't exist" / "run npx playwright install" | Run `npx playwright install chromium` |
| Port 3100 or 5173 already in use | Close the other process, or run the app with `npm run dev -- --port 3000` |
| "API unavailable" badge and an empty list | Your machine can't reach `restful-booker.herokuapp.com`; check your connection or VPN |

## Notes

- **API proxy:** in dev, `/api/*` is forwarded to Restful-Booker, which avoids CORS. Use `API_TARGET=<url> npm run dev` to point at another server.
- **Auth:** edit and delete send `Authorization: Basic ...` because browsers can't set the `Cookie` header. The session is in memory only.
- **Testability:** `App` takes the API as a prop (`<App api={...} />`), and most components take only props and callbacks.
- **Limits:** details are loaded for the first 20 bookings, and the public API resets every 10 minutes.