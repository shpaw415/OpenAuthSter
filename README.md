# OpenAuthster

A multi-tenant authentication server built with [OpenAuth](https://openauth.js.org/), designed for Cloudflare Workers with a complete Web UI for project orchestration.

## Overview

OpenAuthster provides developers with a ready-to-deploy authentication solution featuring:

- 🔐 **OpenAuth Issuer Server** - Secure authentication powered by OpenAuth
- 🏢 **Multi-Tenant Support** - Manage multiple projects/applications from a single deployment
- 🎨 **Web UI Dashboard** - Configure themes, providers, and project settings
- ☁️ **Cloudflare Workers** - Edge-deployed for low latency worldwide
- 📦 **SDKs** — TypeScript (`openauthster-shared`), Swift (`sdk/ios`), Kotlin (`sdk/android`)

## Architecture

OpenAuthster follows a modular architecture:

```
┌─────────────────┐
│  Your App       │
│  (React/Next)   │
└────────┬────────┘
         │ Uses openauth-react
         │
         ▼
┌─────────────────────────────────┐
│  OpenAuthster Issuer            │
│  (Cloudflare Worker)            │
│  • Multi-tenant auth            │
│  • OAuth providers              │
│  • D1 Database                  │
└────────┬────────────────────────┘
         │ Managed by
         │
         ▼
┌─────────────────────────────────┐
│  OpenAuthster WebUI             │
│  (Cloudflare Pages)             │
│  • Project management           │
│  • Theme customization          │
│  • Provider configuration       │
└─────────────────────────────────┘
```

**All components share:**

- Common TypeScript types via `openauthster-shared`
- Consistent API contracts
- Unified session management

## Repository Structure

This repository is a **Bun monorepo**. See `MONOREPO.md`.

| Path | Package | Description |
| --- | --- | --- |
| `apps/issuer` | `openauthster-issuer-server` | Cloudflare Worker issuer |
| `apps/webui` | `openauth-webui` | Cloudflare Pages admin UI |
| `packages/shared` | `openauthster-shared` | Types, D1 schema, TS client |
| `sdk/ios` | Swift Package | Public PKCE client |
| `sdk/android` | Kotlin library | Public PKCE client |

Docs remain at [openauthster-doc](https://github.com/shpaw415/openauthster-doc). React helper remains [openauth-react](https://github.com/shpaw415/openauth-react) until it is imported.

## Workspace Commands

The workspace root now includes an orchestration layer for running the most common tasks across the runtime repositories without changing directories.

Run these from this repository:

```bash
bun run install:core
bun run check
bun run test
bun run build
```

To include docs as well:

```bash
bun run install:all
bun run check:all
bun run test:all
bun run build:all
```

For targeted execution:

```bash
bun run workspace -- test --repo=issuer,shared
bun run workspace -- check --scope=all --continue-on-error
```

This is the first migration phase toward a real monorepo. The source trees are still in sibling repositories, but the control plane now lives in the workspace root. See `MONOREPO.md` for the staged migration approach.

## Getting Started

OpenAuthster requires deploying both the issuer server and WebUI. Follow this sequence:

### Quick Start Guide

1. **Deploy the Issuer** (required first)
   - Clone [OpenAuthSter-issuer](https://github.com/shpaw415/OpenAuthSter-issuer) as a **private repository**
   - Configure D1 database and environment variables
   - Deploy to Cloudflare Workers
   - 📖 [Full issuer setup guide](https://github.com/shpaw415/OpenAuthSter-issuer#installation)

2. **Deploy the WebUI** (requires issuer)
   - Clone [OpenAuthSter-webUI](https://github.com/shpaw415/OpenAuthSter-webUI) as a **private repository**
   - Link to your issuer's D1 database
   - Configure environment variables
   - Deploy to Cloudflare Pages
   - 📖 [Full WebUI setup guide](https://github.com/shpaw415/OpenAuthSter-webUI#installation)

3. **Integrate with Your App**
   - Install the React SDK: `npm install openauth-react` (coming soon)
   - Or use the low-level client from `openauthster-shared` (for local development)
   - 📖 [Client integration guide](https://github.com/shpaw415/OpenAuthSter-shared#openauthsterclient-recommended)

### Security Best Practice

> ⚠️ **Important:** Clone all OpenAuthster repositories as **private repositories** for production use. This protects your authentication configuration, secrets, and custom implementations.

## Documentation

- 📚 [Full Documentation](https://github.com/shpaw415/openauthster-doc) (coming soon)
- 💬 [Discussions & Support](https://github.com/shpaw415/openauthster/discussions)

## Contributing

OpenAuthster is in active development. Contributions, bug reports, and feature requests are welcome!

1. Fork the relevant repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

> License information coming soon
