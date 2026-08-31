# OpenAuthster monorepo

Physical layout after the history-preserving import of issuer, shared, and WebUI.

```
apps/issuer/          OpenAuthSter-issuer (Cloudflare Worker)
apps/webui/           OpenAuthSter-webUI (Cloudflare Pages)
packages/shared/      openauthster-shared (npm)
sdk/ios/              Swift Package (SPM)
sdk/android/          Kotlin library
```

`openauthster-doc` stays a sibling repo. The tester app was not on GitHub (`openauth-webui-tester` missing); `apps/tester` is reserved.

## Commands

```bash
bun install
bun test
bun run check
bun run --filter openauthster-shared test
```

Shared is consumed as `"openauthster-shared": "workspace:*"`.

## Native clients

Public OAuth clients (PKCE, no `project.secret` on device). Store extra redirect URIs and `clientType: "public"` on `project.projectData`. Helpers: `openauthster-shared/native`.

## Old remotes

| Old repo | Now |
| --- | --- |
| `OpenAuthSter-issuer` | `apps/issuer` |
| `OpenAuthSter-shared` | `packages/shared` |
| `OpenAuthSter-webUI` | `apps/webui` |
