# Restful-Booker App

A small React + TypeScript (Vite) front end for the [Restful-Booker API](https://restful-booker.herokuapp.com/apidoc/index.html). It lets you browse, search, create, edit and delete bookings, and log in as an admin. It is built to be easy to test: components are small, take their data and callbacks as props, and the API is injected into `App`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build
```

In development the browser calls `/api/*` and the Vite dev server forwards it to `https://restful-booker.herokuapp.com`, so there are no CORS problems. To use another server, run `API_TARGET=http://localhost:3001 npm run dev`.

## Components

| Component | Purpose | API endpoint |
| --- | --- | --- |
| `HealthStatus` | Shows whether the API is online | `GET /ping` |
| `LoginForm` | Username / password form | `POST /auth` |
| `BookingFilters` | Search by first name, last name, check-in and check-out | `GET /booking?...` |
| `BookingList` | List with loading, error and empty states | `GET /booking`, `GET /booking/:id` |
| `BookingCard` | One booking; edit and confirmed delete when logged in | `PUT` / `DELETE /booking/:id` |
| `BookingForm` | Create or edit form with validation | `POST /booking`, `PUT /booking/:id` |
| `Notification` | Dismissible success / error message | n/a |

All components are in `src/components`. Fields have accessible labels (for example `First name`, `Check-in`), and states use roles such as `status`, `alert` and `article`, so they are easy to query in tests.

## Structure

```
src/
├── App.tsx               # wires components, hooks and the API together
├── main.tsx              # entry point, passes the real API to App
├── api/
│   ├── client.ts         # createApiClient(baseUrl, fetch?) and the BookerApi interface
│   ├── index.ts          # the app's API instance (reads VITE_API_URL, default /api)
│   └── types.ts
├── components/           # the components above
├── hooks/                # useBookings, useAuth, useHealth
└── utils/                # validation, price / nights formatting, error messages
```

## Testing notes

- `App` takes the API as a prop (`<App api={...} />`), so a test can pass a fake `BookerApi` instead of calling the network. You can also use `createApiClient('/api', fakeFetch)` or intercept requests with `page.route`.
- Presentational components (`BookingCard`, `BookingList`, `BookingForm`, `BookingFilters`, `LoginForm`, `Notification`, `HealthStatus`) need no API at all, only props and callbacks.
- Validation rules live in `src/utils/validation.ts`: first name, last name, total price (a number, 0 or more), check-in and check-out are required, and check-out must not be before check-in.

## Authentication

`POST /auth` is used to check the credentials (demo account: `admin` / `password123`). Browsers can't set the `Cookie` header that the API also accepts, so edit and delete requests send the credentials as `Authorization: Basic ...`, which Restful-Booker supports. The session is kept in memory only, so refreshing the page logs you out.

## Limits

- The list endpoint returns only ids, so details are fetched for the first 20 bookings.
- `PATCH /booking/:id` is not used; the edit form sends a full `PUT`.
- Restful-Booker is a shared public instance that resets itself every 10 minutes, so created bookings disappear.
