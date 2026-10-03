# LeaveDesk

A full-stack leave management system. Employees apply for leave, managers approve, reject, escalate or send requests back for changes, and administrators manage policies, balances, holidays, reports and the audit trail.

**Stack:** Node.js · Express 5 · PostgreSQL (raw SQL, `pg`) · JWT · Joi · React 19 · Vite · Tailwind CSS 4 · Jest + supertest

## Features

**Employee**
- Dashboard with leave balances, upcoming holidays and recent requests
- Apply for leave (PL, SL, MCL, Comp-Off) with balance and overlap checks
- Edit a pending request, or update and resubmit one when the manager asks for changes
- Cancel a request (approved days are returned to the balance)
- One-time blood relation leave for six relations, marked *Consumed* after use
- Holiday calendar and in-app notifications

**Manager**
- Approve or reject team requests with remarks
- Escalate a request to administrators, or request changes from the employee
- Team list, team leave calendar and pending approvals on the dashboard
- Can only act on requests from their own team

**Administrator**
- Final decision on pending and escalated requests
- Override a final decision: revoke an approval (days are restored) or approve a rejected request
- Manage users, departments, leave types (yearly limit, carry-forward, expiry) and holidays
- Adjust any employee's leave balance per financial year, with the reason recorded
- Monthly reports: overall, employee-wise, department-wise and leave-type-wise
- Audit log viewer with action and date filters

**Across the app**
- **Sandwich leave policy:** weekends and holidays between leave days are counted (Friday + Monday = 4 days)
- **Event-driven side effects:** notifications, audit logging and balance updates run off an internal event bus
- **Role-based access control** on every route, plus a responsive layout for phones

## Approval workflow

| From | Action | By | To |
|---|---|---|---|
| — | apply | Employee | `PENDING` |
| `PENDING` | approve / reject | Manager (own team) or Admin | `APPROVED` / `REJECTED` |
| `PENDING` | escalate | Manager | `ESCALATED` |
| `PENDING`, `ESCALATED` | request changes | Manager (pending only) or Admin | `CHANGES_REQUESTED` |
| `CHANGES_REQUESTED`, `PENDING` | edit and resubmit | Employee | `PENDING` |
| `ESCALATED`, `MANAGER_APPROVED` | approve / reject | Admin | `APPROVED` / `REJECTED` |
| `APPROVED` | revoke (override) | Admin | `REJECTED`, days restored |
| `REJECTED` | approve (override) | Admin | `APPROVED`, days deducted |
| any open or approved | cancel | Employee | `CANCELLED` |

- A manager's approval is final unless they escalate. Admin review is optional, as the requirements specify.
- Final approval checks the balance up front, and nobody can act on their own request.
- The rules live in one pure state machine, `server/src/modules/approval/approval.workflow.js`, which is fully unit-tested.

## Architecture

The server is a modular monolith. Each module in `server/src/modules/<name>/` has its own `routes → controller → service → repository` layers, plus `validation` and `listener` files.

```
server/src
├── app.js, server.js
├── config/         constants, database pool, env validation
├── shared/         event bus, error classes, middleware, utils
├── modules/        auth, user, role, department, leave-type, holiday, leave-balance,
│                   leave-request, approval, blood-relation-leave, notification,
│                   audit, report, dashboard
├── database/       SQL migrations + seeds
└── tests/          unit + API tests

client/src
├── api/            one module per backend resource (axios)
├── components/     layout, notification bell, modals, badges
├── context/        auth context and roles
└── pages/          employee, manager and admin/ pages
```

Side effects are decoupled through events (`leave:applied`, `leave:approved`, `leave:rejected`, `leave:escalated`, `leave:changes-requested`, `leave:resubmitted`, `leave:cancelled`, `blood-relation:used`, `balance:updated`, `balance:low`). The notification, audit and leave-balance modules each listen independently.

## Getting started

**Prerequisites:** Node.js 20+ and PostgreSQL 14+.

```bash
# 1. Database
createdb leavedesk

# 2. API
cd server
cp .env.example .env          # set DB_PASSWORD and a long random JWT_SECRET
npm install
npm run db:setup              # migrations + roles, leave types, holidays, admin user
npm run dev                   # http://localhost:5000/api

# 3. Client (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

Sign in with the seeded administrator `admin@leavedesk.com` / `admin123` and change the password afterwards. Then create managers and employees from **Users**. Balances are initialised when a user is created, and can be managed later from **Leave Balances**.

The client calls `http://localhost:5000/api` by default. Set `VITE_API_URL` to point it elsewhere, and set `CLIENT_ORIGIN` on the server to the client's origin so CORS allows the session cookie.

## Scripts

| Location | Command | Purpose |
|---|---|---|
| server | `npm run dev` / `npm start` | Run the API (nodemon / node) |
| server | `npm run db:setup` | Apply migrations and seed data |
| server | `npm run migrate` | Apply pending SQL migrations only |
| server | `npm test` | Run the Jest test suite (no database needed) |
| client | `npm run dev` / `npm run build` | Vite dev server / production build |
| client | `npm run lint` | oxlint |

## Tests

```bash
cd server && npm test
```

61 tests cover:
- the approval state machine
- sandwich-leave calculation
- date helpers
- the error handler
- supertest API checks for authentication, role-based access and input validation

## API overview

All endpoints are under `/api` and need an authenticated session except login, logout and health. Login sets the JWT in an httpOnly `lms_token` cookie (the browser client relies on this); non-browser clients may send `Authorization: Bearer <token>` instead.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` |
| Leave requests | `POST /leave-requests`, `GET /leave-requests`, `GET /leave-requests/team`, `GET /leave-requests/all`, `GET /leave-requests/:id`, `PUT /leave-requests/:id`, `PATCH /leave-requests/:id/cancel` |
| Approvals | `GET /approvals/pending`, `PATCH /approvals/:id/{approve,reject,escalate,request-changes}`, `GET /approvals/:id/history` |
| Balances | `GET /leave-balances`, `GET/PUT /leave-balances/:userId`, `POST /leave-balances/initialize` |
| Blood relation | `GET /blood-relation-leaves`, `POST /blood-relation-leaves/use` |
| Admin | `/users`, `/roles`, `/departments`, `/leave-types`, `/holidays`, `/reports/summary/*`, `/audit-logs`, `/audit-logs/action-types` |
| Other | `/dashboard`, `/notifications`, `/health` |

Responses use one shape: `{ success, message, data, pagination? }`. Errors return `{ success: false, message, error: { code } }`.

## Known limitations

- **Notifications are in-app only.** Email and SMS channels are not implemented.
- **No year-end automation.** Carry-forward limits and Comp-Off expiry can be configured on leave types, but no scheduled job applies them; balances are adjusted manually.
- **Date handling assumes the server runs in UTC or a timezone east of UTC.**

## License

[MIT](LICENSE)
