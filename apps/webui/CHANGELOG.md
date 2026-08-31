# Changelog — openauth-webui

## v0.3.1 — 2026-03-13

### Bug Fixes

#### Security
- **Development auth bypass could reach production** — `if (context.env.NODE_ENV === "development") return await context.next()` skipped all API authentication. If deployed with `NODE_ENV=development`, the entire Admin API was publicly accessible. The bypass is now restricted to non-production hosts via an explicit `ENV` allowlist. (`src/api/_middleware.ts`)
- **Full stack traces returned in 500 responses** — `${err.message}\n${err.stack}` was sent to clients in production, leaking file paths and internal code structure. Error responses now return a generic message; the stack trace is logged server-side only. (`src/api/_middleware.ts`)
- **`originURL` not validated before embedding in invite links** — If `project.originURL` was set to a malicious domain, generated invite links would redirect users to an attacker's server. The URL is now validated against the project's registered domain before constructing the link. (`src/api/invitelink/index.ts`)

#### High
- **Non-atomic project creation left orphaned Cloudflare domains** — The Cloudflare custom domain step was irreversible. If the subsequent DB insert or `createUserTable` call failed, the domain was permanently orphaned. Cloudflare domain deletion is now called in the error path on any failure. (`src/api/projects/index.ts`)
- **Project deletion left orphaned records in 6 tables** — Deleting a project removed only the project row and its users table. Records in `WebHookTable`, `totpTable`, `totpTokenTable`, `webauthnCredentialsTable`, `webauthnChallengesTable`, and `WebUiInviteLinkTable` were silently left behind. All associated records are now removed atomically, and Cloudflare domain deletion is properly awaited and errors are logged. (`src/api/projects/manage.ts`)
- **User deletion left orphaned TOTP and WebAuthn records** — Deleting a user left rows in `totpTable`, `totpTokenTable`, `webauthnCredentialsTable`, and `webauthnChallengesTable`. A future user with the same identifier could inherit stale MFA configuration. All MFA records are now deleted as part of the same operation. (`src/api/_users/index.ts`)

#### Medium
- **Input validation order was wrong in project creation** — `isClientIdValid(clientID)` ran before the null-check, making the empty-string guard unreachable and suppressing the specific "missing ID" error message. Guards are now ordered: null/type check first, then format validation. (`src/api/projects/index.ts`)
- **Generated Cloudflare subdomain could exceed 63-character DNS label limit** — The UUID prefix + hostname could produce labels longer than the DNS maximum. The UUID prefix is now truncated so the total label length stays within 63 characters. (`src/cloudflare/index.ts`)
- **`expireInMin` invite link parameter had no bounds checking** — Negative values created pre-expired links; extremely large values created effectively permanent ones. `expireInMin` is now validated to be a positive integer within 1–43200 minutes (30 days). (`src/api/invitelink/index.ts`)
- **Mock usage data returned in production API responses** — `getMockUsageOverTime(...)` was called and its fabricated values returned to the client when a project had no real activity, causing operators to see non-zero charts on empty projects. Empty/zero data is now returned instead. (`src/api/dashboard/index.ts`)

### New Features

- **Copy template API extended to support `qr` and `passkey` provider types** — `CopyTemplate.providerType` was limited to `"code" | "password"`. QR and passkey copy templates can now be created and updated via the API without direct DB access. Both `POST /api/templates/copy` and `PUT /api/templates/copy/:name` accept and validate the new types. (`src/actions/api/templates/copy/`)
- **Logs endpoint now supports pagination** — `GET /api/logs` previously fetched all rows for a project with no limit, causing unbounded memory usage and slow responses for high-traffic projects. The endpoint now accepts `page` (default: 1) and `limit` (default: 50, max: 200) query parameters. Responses include a `pagination: { page, limit }` field. (`src/actions/api/logs/index.ts`)

### Code Quality

- **Inconsistent secondary auth check pattern removed** — `PUT` and `DELETE` handlers in template routes redundantly called `createClient().setTokenFromRequest(request)` in addition to global middleware while `GET` did not. All handlers now rely solely on the middleware. (`src/api/_templates/id.ts`)
- **Misleading `useEffect` dependency array corrected** — `[client.current.fetch]` was a stable reference that never changes, making the effect functionally equivalent to `[]` while confusing ESLint. Changed to `[]` with an explanatory comment. (`src/hooks/useAuth.tsx`)
- **`undefined as any` casts replaced with explicit `null`** — `themeId`, `emailTemplateId`, and `projectData` columns were assigned `undefined as any` to work around type errors. Drizzle schema types updated to `string | null` and values set to `null` explicitly. (`src/api/projects/index.ts`)
