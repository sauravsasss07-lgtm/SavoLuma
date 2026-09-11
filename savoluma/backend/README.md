# SavoLuma Platform — Backend

Spring Boot + Spring Security + JWT + MySQL starter for the SavoLuma internal
platform. This is a **working foundation**, not the full 70-section spec —
it implements the authentication/authorization backbone and the core
Users/Projects/Tasks modules end-to-end, structured so the remaining
modules (full CRM, Finance, Client Portal, Notifications, Support) can be
added the same way without touching what's already here.

## What's implemented

- **Security**: stateless JWT auth, BCrypt password hashing, role-based
  endpoint authorization (`SecurityConfig`), a two-step 2FA flow for
  ADMIN/CEO/SUPER_ADMIN (`TwoFactorService`), clean JSON error responses
  (`GlobalExceptionHandler`, `RestAuthEntryPoint`, `RestAccessDeniedHandler`).
- **Users/Employees**: create (HR/Admin), update, block/unblock ("fire" =
  block, matching the frontend), hard delete, direct-reports lookup.
- **Projects**: list all (privileged roles), "my projects" (manager view),
  create, update with resource-level ownership check.
- **Tasks**: "my tasks" (assignee view), "managed" (manager's task board),
  create (manager-of-project only), status update (assignee, project
  manager, or admin only — enforced in code, not just hidden in the UI).
- **Audit logging**: every create/update/delete/status-change writes an
  `AuditLog` row via `AuditService`.
- Full MySQL schema for every module in the spec is already in
  `schema.sql`, even for tables the Java layer doesn't use yet (leads,
  tickets, consultations, finance, notifications, etc.) — so the database
  design doesn't need to change as you build out the remaining
  controllers/services.

## Not yet implemented (schema exists, Java layer doesn't)

CRM (Leads/Deals) service+controller beyond the `Lead` entity/repository,
Support Ticket workflow, Client Portal + `ClientUser` auth, Finance module,
Notifications, full Role/Permission persistence (currently the frontend
demo manages this in-browser — `roles`/`permissions`/`role_permissions`
tables are ready for it), and file upload handling for resumes/documents.
Follow the same pattern as `UserController`/`ProjectController`/`TaskController`
for each: DTO → Service (+ audit logging) → Controller (+ `@PreAuthorize`)
→ add the matcher to `SecurityConfig`.

## Running locally

1. Install MySQL 8, create the database:
   ```
   mysql -u root -p < schema.sql
   ```
2. Set environment variables (or create a local `.env`/IDE run config):
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=savoluma_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   JWT_SECRET=replace_with_a_long_random_string_before_any_real_use
   CORS_ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
   ```
3. `mvn spring-boot:run`
4. API is at `http://localhost:8080/api/v1/...`, Swagger UI at
   `http://localhost:8080/swagger-ui.html`.

There is no seed-data script yet — insert a first ADMIN user manually
(hash a password with BCrypt first) so you have something to log in with,
e.g.:
```sql
INSERT INTO users (employee_id, username, password_hash, full_name, email, role, status)
VALUES ('SL-2026-0001', 'admin', '$2a$10$<bcrypt-hash-here>', 'System Administrator', 'admin@savoluma.com', 'ADMIN', 'ACTIVE');
```

## Connecting the frontend

The frontend currently runs entirely on a browser-side mock database
(`frontend/js/data.js` + `frontend/js/api.js`) so every screen works
without this backend running. To connect them:

1. In `frontend/js/api.js`, replace each function body with a `fetch()`
   call to the matching endpoint below (the comment above each function
   already names it).
2. Store the JWT from `/api/v1/auth/login` (and the `/verify-2fa` step,
   for 2FA roles) instead of `SavoAuth`'s `mockToken`.
3. Send it as `Authorization: Bearer <token>` on every request.

| Frontend action | Endpoint |
|---|---|
| Login | `POST /api/v1/auth/login` → maybe `POST /api/v1/auth/verify-2fa` |
| List / create employees | `GET` / `POST /api/v1/users` |
| Block / unblock employee | `PATCH /api/v1/users/{employeeId}/status` |
| Remove employee | `DELETE /api/v1/users/{employeeId}` |
| Manager's projects | `GET /api/v1/projects/my` |
| All projects (Admin/CEO) | `GET /api/v1/projects` |
| Create project | `POST /api/v1/projects` |
| Employee's tasks | `GET /api/v1/tasks/my` |
| Manager's task board | `GET /api/v1/tasks/managed` |
| Assign task | `POST /api/v1/tasks` |
| Update task status | `PATCH /api/v1/tasks/{id}/status` |

## Security notes

- Never commit a real `JWT_SECRET` — the placeholder in `application.yml`
  will fail obviously if left in production.
- 2FA codes are generated in-memory in `TwoFactorService` for this
  starter; swap in an email/SMS provider and a persistent store (Redis or
  a DB table with TTL) before relying on it.
- Every role-restricted endpoint is enforced in `SecurityConfig` and/or
  `@PreAuthorize` — the frontend hiding a button is never the only check.
