# Restful-Booker App

React + TypeScript (Vite) front end for the [Restful-Booker API](https://restful-booker.herokuapp.com/apidoc/index.html): browse, search, create, edit and delete bookings.

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev     # http://localhost:5173
```

Log in with `admin` / `password123` to enable edit and delete.

Other scripts: `npm run build` (type-check and build), `npm run preview` (serve the build; it has no API proxy, so use `dev` to see live data).

## Component tests

Playwright component tests (`@playwright/experimental-ct-react`) live in `tests/component`, next to `src`.

```bash
npx playwright install chromium   # once
npm run test:ct                   # run all component tests
npm run test:ct:ui                # interactive UI mode
```

| Spec | Covers |
| --- | --- |
| `BookingCard.spec.tsx` | Display (name, id, dates, nights, price, deposit badge, needs), Edit / Delete visibility by permission, edit callback, delete confirm and cancel |

Config is in `playwright-ct.config.ts`; `playwright/index.tsx` loads the app styles for every test.

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
```

## Notes

- **API proxy:** in dev, `/api/*` is forwarded to Restful-Booker, which avoids CORS. Use `API_TARGET=<url> npm run dev` to point at another server.
- **Auth:** edit and delete send `Authorization: Basic ...` because browsers can't set the `Cookie` header. The session is in memory only.
- **Testability:** `App` takes the API as a prop (`<App api={...} />`), and most components take only props and callbacks.
- **Limits:** details are loaded for the first 20 bookings, and the public API resets every 10 minutes.
