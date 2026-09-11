# SavoLuma — Software Company Platform

Two parts:

- **`frontend/`** — the complete public website and internal portal.
  Pure HTML/CSS/vanilla JS, fully working right now with a mock
  browser-side database. Just open `frontend/index.html`.
- **`backend/`** — a Spring Boot + Spring Security + JWT + MySQL starter
  implementing the real authentication and the Users/Projects/Tasks
  modules end-to-end. See `backend/README.md` for how to run it and how
  to wire it into the frontend.

## Quick start (frontend only, no setup)

Open `frontend/index.html` directly in a browser, or serve the folder
with any static server (e.g. VS Code's "Live Server", or
`python3 -m http.server` from inside `frontend/`) — some browsers
restrict `fetch`/module behaviour on `file://` URLs, so a local server is
recommended over double-clicking the file.

**Demo logins** (from `frontend/portal/index.html`):

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| CEO | `ceo` | `Ceo@1234` |
| HR | `hr.priya` | `Hr@12345` |
| Manager | `mgr.rohan` | `Mgr@12345` |
| Employee | `emp.sneha` | `Emp@12345` |

All employee/project/task/lead/ticket data lives in the browser's
`localStorage` (`frontend/js/data.js`) and resets if you clear site data.

## Folder structure

```
frontend/
  index.html
  pages/           about, services, careers, clients, contact, terms,
                    privacy, cookies, faq, blog
  portal/           login hub, 5 role logins, register, 5 dashboards
  css/              one file per page/section (global.css + dashboard.css shared)
  js/               one file per page/section (data.js + api.js shared data layer)
  assets/images/    logo.jpeg, favicon.jpeg

backend/
  src/main/java/com/savoluma/
    config/          SecurityConfig
    security/        JWT filter/util, 2FA, UserDetailsService
    controller/       Auth, User, Project, Task
    service/          UserService (+impl), AuditService
    dto/               request/response objects
    entity/            JPA entities
    repository/        Spring Data JPA repositories
    exception/          GlobalExceptionHandler
  schema.sql          full MySQL DDL for every module in the spec
  application.yml     env-var driven config (DB, JWT, CORS, 2FA roles)
  README.md           setup + frontend-to-backend wiring guide
```

## What to do next

1. Skim `backend/README.md` — it has the run steps and a table mapping
   every frontend action to its real endpoint.
2. Everything visual (colors, copy, layout) lives in `frontend/` and can
   be edited without touching the backend.
3. When you're ready to go from demo to real data, connect MySQL, run
   `schema.sql`, and start swapping `frontend/js/api.js` functions for
   `fetch()` calls one at a time — the app keeps working throughout
   since each function is self-contained.
