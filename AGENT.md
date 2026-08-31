# OpenAuthster — AI Agent Context

## Project Overview

OpenAuthster is a **multi-tenant, self-hosted authentication server** built on [@openauthjs/openauth](https://openauth.js.org/), deployed to **Cloudflare Workers + D1 (SQLite)**. It is organized as a **multi-repo workspace** with a central shared library.

The current repository (`openauthster`) is the **workspace root** — it holds workspace config and documentation. All source code lives in sibling directories.

---

## Repository Map

| Local Folder                  | Package Name                        | GitHub Repo           | Role                                                         |
| ----------------------------- | ----------------------------------- | --------------------- | ------------------------------------------------------------ |
| `openauthster-shared` | `openauthster-shared` v0.3.0        | `OpenAuthSter-shared` | **Shared library** — types, DB schema, client SDK, providers |
| `openauth-multitenant-server` | `openauthster-issuer-server` v0.3.0 | `OpenAuthSter-issuer` | Cloudflare Worker — auth issuer server                       |
| `openauth-webui`              | `openauth-webui` v0.3.0             | `OpenAuthSter-webUI`  | Cloudflare Pages — admin dashboard                           |
| `openauth-webui-tester`       | (private)                           | —                     | Integration test app                                         |
| `openauthster-doc`            | —                                   | `openauthster-doc`    | Documentation site                                           |

Both the issuer and WebUI declare the shared library as a git dependency:

```json
"openauthster-shared": "https://github.com/shpaw415/OpenAuthSter-shared.git#v0.3.0"
```

**Runtime**: Bun (dev), Cloudflare Workers (prod). Use `bun` for all package management commands.

---

## Shared Library (`openauthster-shared`)

This is the core of the system. All exports use TypeScript source files directly (no build step required for consumers).

### Package Exports

```
openauthster-shared
├── .                          → index.ts                         (types, constants, registry)
├── ./database                 → database/schema.ts               (Drizzle table definitions)
├── ./database/types           → database/types.ts                (DB row types)
├── ./drizzle                  → database/drizzle.ts              (Drizzle helpers)
├── ./endpoints                → database/endpoints.ts            (API endpoint types/validators)
├── ./client                   → client/index.ts                  (low-level openauth client)
├── ./client/user              → client/user.ts                   (OpenAuthsterClient class)
├── ./client/mfa               → client/mfa/index.ts              (TOTP / MFA manager)
├── ./client/errors            → client/errors.ts                 (typed error classes)
├── ./utils                    → utils.ts                         (cookie utilities)
├── ./providers                → providers/index.ts               (per-provider UserInfo types)
├── ./providers/utils          → providers/utils.ts               (createSelfClient for Workers)
├── ./providers/custom/*       → providers/custom/*               (QR + WebAuthn providers)
├── ./providers/custom/out/*   → providers/build/*                (pre-built browser bundles)
├── ./webhook/types            → webhook/types.ts                 (webhook event types)
├── ./webhook                  → webhook/index.ts                 (WebHook class)
└── ./security                 → security/index.ts                (HMAC helpers)
```

---

### `index.ts` — Types & Constants

**Key types:**

```typescript
type ProviderType =
  "code" | "oidc" | "oauth" | "appleoauth" | "appleoidc" | "apple"
  | "x" | "slack" | "yahoo" | "google" | "github" | "twitch" | "spotify"
  | "cognito" | "discord" | "facebook" | "keycloak" | "password"
  | "microsoft" | "jumpcloud" | "qr" | "passkey"

type ProviderCategory = "social" | "enterprise" | "custom" | "form"

// Per-provider config types (union):
type ProviderConfig =
  | OAuth2ProviderConfig  // x, spotify, discord, facebook, github, twitch, yahoo, jumpcloud
  | GoogleProviderConfig | MicrosoftProviderConfig | AppleOAuthProviderConfig
  | AppleOIDCProviderConfig | CognitoProviderConfig | SlackProviderConfig
  | OIDCProviderConfig | GenericOAuthProviderConfig | KeycloakProviderConfig
  | CodeProviderConfig | PasswordProviderConfig | QRProviderConfig | WebAuthnProviderConfig

// Project config:
type Project = {
  clientID: string
  created_at: number
  active: boolean
  providers_data: ProviderConfig[]
  themeId?: string
  emailTemplateId?: string
  codeMode: "email" | "phone"
  projectData?: ProjectData
  originURL?: string
  authEndpointURL: string
  cloudflareDomaineID: string
  registerOnInvite: boolean
  secret: string
}

// External config for app-side setup (delivery services, registration hooks):
type ExternalGlobalProjectConfig<CTXProperties> = {
  register: {
    fallbackEmailFrom: string
    onSuccessfulRegistration?: (ctx, value, request) => void
    strategy: {
      email?: { provider: "resend"; apiKey } | { provider: "custom"; sendEmailFunction }
      phone?: { provider: "twilio"; ... } | { provider: "custom"; sendSMSFunction }
    }
  }
}
```

**Constants:**

```typescript
const COOKIE_NAME = "oauth_client_id";
const COOKIE_COPY_TEMPLATE_ID = "oauth_copy_template_id";
const COOKIE_INVITE_ID = "oauth_invite_id";
const PUBLIC_CLIENT_ID = "openauth_webui"; // reserved project ID for the WebUI admin app
const PROVIDER_REGISTRY: ProviderMeta[]; // metadata for all supported providers
```

**Functions:**

```typescript
getProviderMeta(type: ProviderType): ProviderMeta | undefined
getProvidersByCategory(category: ProviderCategory): ProviderMeta[]
createExternalGlobalProjectConfig(config): ExternalGlobalProjectConfig
```

---

### `database/schema.ts` — Drizzle D1 Schema (Single Source of Truth)

All tables shared between the issuer and WebUI. Imported as `import { ... } from "openauthster-shared/database"`.

**Static tables (SQLite name → purpose):**

| Table object               | SQLite name                      | Purpose                                                          |
| -------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `projectTable`             | `openauth_webui_projects`        | Per-tenant project configs (clientID PK, providers JSON, secret) |
| `WebHookTable`             | `openauth_webui_webhooks`        | Webhook registrations per project                                |
| `emailTemplatesTable`      | `openauth_webui_email_templates` | Mustache email/SMS templates                                     |
| `uiStyleTable`             | `openauth_webui_ui_styles`       | UI theme JSON                                                    |
| `webuiProjectTable`        | `openauth_webui`                 | Key-value store for WebUI session                                |
| `totpTable`                | `openauth_totp`                  | TOTP secrets + backup codes per user                             |
| `totpTokenTable`           | `openauth_totp_tokens`           | Short-lived elevated TOTP tokens (5 min TTL)                     |
| `WebUiCopyTemplateTable`   | `openauth_webui_copy_templates`  | i18n copy templates per provider UI                              |
| `WebUiInviteLinkTable`     | `openauth_webui_invite_links`    | Invite links with expiry                                         |
| `LogsTable`                | `openauth_webui_logs`            | Structured audit/error logs                                      |
| `webauthnChallengesTable`  | `webauthn_challenges`            | WebAuthn authentication challenges                               |
| `webauthnCredentialsTable` | `webauthn_credentials`           | WebAuthn public key credentials                                  |
| `webAuthnTokenAccessTable` | `webauthn_token_access`          | One-time passkey auth tokens (5 min TTL)                         |

**Dynamic per-tenant user table factory:**

```typescript
OTFusersTable(clientID: string)
// Returns Drizzle table definition for `${clientID}_users`
// Columns: id (PK), identifier (UNIQUE), data (JSON), session_private, session_public, created_at
```

**Schema helpers:**

```typescript
createUserTable(clientID, database)         // CREATE TABLE IF NOT EXISTS for a project
DeleteOTFusersTable(clientID, database)     // DROP TABLE for a project
isClientIdValid(name: string): boolean      // /^[a-zA-Z_][a-zA-Z0-9_]{2,29}$/
parseDBUser(user) / serializeDBUser(user)   // JSON parse/stringify session fields
parseDBProject(data): Project               // coerce D1 types to TypeScript Project
parseDBTOTP(data): TOTPTableType
insertLog({ type, clientID, endpoint?, message, database, context? })
```

---

### `client/user.ts` — `OpenAuthsterClient` (Primary Client Class)

The main class used by both application developers and the WebUI itself.

```typescript
class OpenAuthsterClient<PublicSessionData, PrivateSessionData, UserInfo> {
  // State
  openAuthClient: Client
  expiresAt: Date | null
  isLoaded: boolean                    // true after init() completes
  isAuthenticated: boolean
  data: { public: PublicSessionData; private: PrivateSessionData }
  userMeta: { user_id: string | null; user_identifier: string | null }
  userInfo: UserInfo | null
  error: { error: string; error_description: string | null } | null
  mfa: MFAmanager                      // TOTP access
  passkey: Passkey                     // WebAuthn access

  // Initialization (Browser)
  async init(): Promise<this>
  triggerUpdate(): Promise<void>

  // Auth flow (Browser)
  async login(options?): Promise<string>  // returns authorize URL
  logout(): Promise<void>
  async callback(): Promise<void>          // call this on the redirect callback route

  // Session management
  getUserSession(type: "public" | "private"): Promise<...>
  updateUserSession(type, data): Promise<...>
  clearPublicSession(): Promise<...>
  clearPrivateSession(): Promise<...>

  // Admin (Server-side, requires `secret`)
  getUserById(user_id): Promise<...>
  getUsers(filters?: { page?, limit? }): Promise<...>
  updateUserById(user_id, data): Promise<...>
  deleteUserById(user_id): Promise<...>

  // Token management
  getToken(): string | null
  verify(token?): Promise<boolean>
  async triggerRefresh(): Promise<boolean>
  setTokenToCookie(): void               // Browser
  getTokenFromRequest(request): string | null   // Server
  setTokenFromRequest(request): Promise<this>   // Server

  // Authenticated fetch (adds Bearer + HMAC signature)
  async fetch(input, init?): Promise<Response>
  async fetchWithOptions(input, init?, options?): Promise<Response>

  // Events
  addInitializationListener(key, callback): void
  removeInitializationListener(key): void

  updateOptions(options: { copyID?, secret? }): void
}

function createOpenAuthsterClient<Public, Private, UserInfo>(props): OpenAuthsterClient<...>

// Token subject schema (for token verification):
const defaultSubjectSchema
// subject.user = { id, identifier, role, data, clientID, provider }
```

**localStorage keys used:** `oa_token`, `oa_refresh_token`, `oa_challenge`, `oa_expires_at`

---

### `client/mfa/` — TOTP / MFA

```typescript
class TOTPClient {
  // Client-side
  async setupTotp(): Promise<TOTPSetupData | TotpError>
  // → { uri, secret, backupCodes }
  async confirmSetup({ code }): Promise<boolean>
  async getElevatedToken(code): Promise<{ token, fetch } | TotpError | null>
  async verifyTOTPCode(code): Promise<boolean | TotpError>
  async removeMFAWithBackupCode(backupCode)
  async removeMFAWithElevatedToken({ elevatedToken? | TOTPCode })
  async resetMFAWithBackupCode(backupCode)
  elevatedFetch({ input, init, elevatedToken })

  // Server-side
  async verify(token: string): Promise<boolean | TotpError>
  async verifyFromRequest(request: Request): Promise<boolean | TotpError>
  async removeMFAById(userID: string)    // admin only
}
```

---

### `client/errors.ts` — Typed Error Classes

```typescript
class CallbackError extends Error           // OAuth callback failures
class RefreshError extends Error            // type: "missing_refresh_token" | "refresh_failed"
class TokenVerificationError extends Error
class TotpError extends Error               // 13 specific error types
```

---

### `webhook/` — Outgoing Webhooks

```typescript
type WebHookEvents =
  "registration_success" | "login_success" | "login_attempt"
  | "password_reset" | "code_sent"
  | "mfa_setup" | "mfa_update" | "mfa_confirmed" | "mfa_removed"

class WebHook {
  constructor({ db: D1Database })
  register({ event, config, clientID })
  update({ webHookID, config })
  getWebHooks(clientID, filters?)
  deleteWebHook(webHookID)
  trigger({ clientID, event, secret, data, log?, request })
  // Signs payload with HMAC-SHA256(payload, project.secret) → "x-secret" header
  // 5-second AbortSignal timeout per target

  static getWebHookPayloadFromRequest(event, request, appSecret)
  // Verify incoming webhook: checks x-secret HMAC + 5-min replay window

  static create(config)   // returns restricted view (app-side only)
}
```

---

### `providers/custom/` — Custom Providers

**QR Provider** (`providers/custom/qr/index.ts`):

- Generates a QR code page with a WebSocket connection
- Mobile scans → `POST /qr/validate` with JWT → issuer pushes OAuth code to PC via WebSocket
- Uses `QRHandshake` Durable Object for state
- Config: `{ binding, issuerURI, appURI, copy?, client_id, issuer, subject, UI }`

**WebAuthn / Passkey Provider** (`providers/custom/passkey/index.ts`):

- Full WebAuthn registration + authentication flow
- Uses `@simplewebauthn/server` on the Worker side and `@simplewebauthn/browser` in the browser
- Config: `{ db: D1Database, rpID, origin, flow?, UI }`
- Browser script served from `GET /passkey/client.js`

---

### `security/index.ts`

```typescript
hashWithSecretKey(data: string, secretKey: string): Promise<string>
// HMAC-SHA256 → lowercase hex

verifySignature({ data, signatureHex, secretKey }): Promise<boolean>
```

---

## Issuer Server (`openauth-multitenant-server`)

- **Runtime**: Cloudflare Worker (Hono app)
- **Multi-tenancy**: reads `oauth_client_id` cookie → looks up `projectTable` → builds OpenAuth issuer per request
- **Re-exports** `QRHandshake` Durable Object from shared library

**API endpoints:**

| Method               | Path                                                             | Description                                                                       |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `*`                  | `/...`                                                           | OpenAuth core (`/authorize`, `/token`, `/.well-known/openid-configuration`, etc.) |
| `GET\|PATCH\|DELETE` | `/session/{type}/{clientID}`                                     | User session read/write/clear                                                     |
| `GET`                | `/user/{clientID}/{user_id}`                                     | Get user (secret required)                                                        |
| `PUT`                | `/user/{clientID}/{user_id}`                                     | Update user (secret required)                                                     |
| `DELETE`             | `/user/{clientID}/{user_id}`                                     | Delete user (secret required)                                                     |
| `GET`                | `/users/{clientID}`                                              | Paginated user list (secret required)                                             |
| `POST`               | `/totp/setup\|confirm\|elevate\|validate\|verify\|remove\|reset` | TOTP MFA endpoints                                                                |
| `DELETE`             | `/admin/totp/{userID}`                                           | Admin: remove TOTP for user                                                       |
| `GET`                | `/passkey/generate_challenge`                                    | WebAuthn auth challenge                                                           |
| `POST`               | `/passkey/register/start\|finish`                                | WebAuthn registration flow                                                        |
| `POST`               | `/passkey/authorize/token/:challenge_id`                         | WebAuthn verify assertion                                                         |
| `GET`                | `/passkey/callback/:token`                                       | Exchange passkey token for session                                                |
| `GET`                | `/qr/ws`                                                         | QR WebSocket proxy (Durable Object)                                               |
| `POST`               | `/qr/validate`                                                   | Mobile QR validation endpoint                                                     |
| `GET\|POST`          | `/invitelink`                                                    | Invite link handling                                                              |

---

## WebUI (`openauth-webui`)

- **Runtime**: Cloudflare Pages (SSR with `frame-master` + React + Tailwind)
- **Auth**: authenticates its own admin users against the issuer using `PUBLIC_CLIENT_ID = "openauth_webui"`
- **Shares the same D1 database** as the issuer — all Drizzle tables from the shared library apply to both

---

## Architecture Data Flow

```
Client App
  └── createOpenAuthsterClient({ clientID, issuerURI, redirectURI, subject })
        ├── login()    → redirect to issuer /authorize?client_id={clientID}
        ├── init()     → exchange code, restore tokens from localStorage
        ├── verify()   → validate JWT subject using defaultSubjectSchema
        ├── getUserSession("public")  → GET /session/public/{clientID}
        └── fetch()    → adds Authorization: Bearer + X-Client-Signature (HMAC)

Issuer Server (Cloudflare Worker)
  ├── Reads projectTable from D1 (shared schema)
  ├── Builds per-request OpenAuth issuer with project's provider list
  ├── Writes/reads OTFusersTable(clientID) for user data
  ├── Fires WebHooks on auth events (HMAC-signed)
  └── Exposes /session, /user, /totp, /passkey, /qr endpoints

WebUI (Cloudflare Pages)
  ├── Reads/writes same D1 database
  ├── Manages projects, email templates, themes, webhooks, copy templates
  └── Authenticates via PUBLIC_CLIENT_ID="openauth_webui" on the issuer
```

---

## Key Design Patterns

### 1. Per-Tenant Dynamic User Tables

Each project gets its own `${clientID}_users` SQLite table. `OTFusersTable(clientID)` creates the Drizzle table definition dynamically. `clientID` must match `/^[a-zA-Z_][a-zA-Z0-9_]{2,29}$/`.

### 2. Two-Tier Session Model

Every user row stores `session_public` (accessible from browser via `/session/public/`) and `session_private` (server-side only, requires HMAC-signed request). Both are arbitrary JSON blobs defined by the application.

### 3. HMAC Request Signing for Admin Operations

Client sets `secret` in `createOpenAuthsterClient`. Every admin request includes:

- `X-Client-Timestamp`: current UNIX timestamp
- `X-Client-Signature`: `HMAC-SHA256(timestamp:clientID, secret)`
  The server rejects requests with signatures older than 5 minutes.

### 4. Webhook HMAC Signing + Replay Protection

Outgoing webhooks include `x-secret = HMAC-SHA256(JSON.stringify(payload), project.secret)`. Receivers must call `WebHook.getWebHookPayloadFromRequest()` to verify and enforce the 5-minute replay window.

### 5. Copy Templates (i18n)

Provider UI strings are stored in `openauth_webui_copy_templates` and selected via `oauth_copy_template_id` cookie. This enables multi-language support without redeploying the issuer.

### 6. QR Code Flow via Durable Objects

QR auth uses a `QRHandshake` Durable Object to hold ephemeral WebSocket state between the PC browser (WebSocket consumer) and the mobile device (REST validator). The DO has a 5-minute alarm for cleanup.

### 7. Passkey/WebAuthn Flow

Registration: browser `→ POST /passkey/register/start → startRegistration() → POST /passkey/register/finish`
Authentication: browser `→ GET /passkey/generate_challenge → startAuthentication() → POST /passkey/authorize/token/:id → GET /passkey/callback/:token`

---

## Secret Management

- Each project has a `secret` field in `projectTable` — used for HMAC signing of admin requests and webhooks
- `PUBLIC_CLIENT_ID = "openauth_webui"` is the reserved project for the WebUI admin interface itself
- Email/SMS delivery credentials are configured via `ExternalGlobalProjectConfig` in `openauth.config.ts` (issuer-side, not stored in DB)

---

## Dependencies Summary

| Library                               | Purpose                                          |
| ------------------------------------- | ------------------------------------------------ |
| `@openauthjs/openauth`                | Core OAuth/OIDC issuer + provider framework      |
| `drizzle-orm`                         | Type-safe SQLite/D1 ORM (peer dep)               |
| `hono`                                | Request routing in Workers (peer dep)            |
| `valibot`                             | Schema validation for API request/response types |
| `@simplewebauthn/browser` + `/server` | WebAuthn / passkey support                       |
| `jose`                                | JWT signing and verification                     |
| `mustache`                            | Email/SMS template rendering                     |
| `uqr`                                 | QR code SVG generation                           |
| `cloudflare`                          | Cloudflare Workers/D1 type bindings              |
