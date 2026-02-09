# OpenAuthster

A multi-tenant authentication server built with [OpenAuth](https://openauth.js.org/), designed for Cloudflare Workers with a complete Web UI for project orchestration.

## Overview

OpenAuthster provides developers with a ready-to-deploy authentication solution featuring:

- 🔐 **OpenAuth Issuer Server** - Secure authentication powered by OpenAuth
- 🏢 **Multi-Tenant Support** - Manage multiple projects/applications from a single deployment
- 🎨 **Web UI Dashboard** - Configure themes, providers, and project settings
- ☁️ **Cloudflare Workers** - Edge-deployed for low latency worldwide
- 📦 **Full-Stack SDKs** - React hooks, TypeScript client, and shared types

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

OpenAuthster is a **multi-repo project** consisting of the following repositories:

> **Note:** GitHub repository names may differ from local workspace folder names. The table below shows the published GitHub repository names.

### Core Repositories

| Repository                                                                 | Workspace Folder              | Description                                                                                          |
| -------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| **[OpenAuthSter-issuer](https://github.com/shpaw415/OpenAuthSter-issuer)** | `openauth-multitenant-server` | Cloudflare Worker containing the OpenAuth issuer server with multi-tenant capabilities               |
| **[OpenAuthSter-webUI](https://github.com/shpaw415/OpenAuthSter-webUI)**   | `openauth-webui`              | Web UI dashboard for managing projects, customizing themes, and configuring authentication providers |
| **[OpenAuthSter-shared](https://github.com/shpaw415/OpenAuthSter-shared)** | `openauth-webui-shared-types` | Shared TypeScript types, database schemas, and client SDK for connecting to OpenAuthster             |

### Client SDKs

| Repository                                                       | Workspace Folder | Description                                      | Status |
| ---------------------------------------------------------------- | ---------------- | ------------------------------------------------ | ------ |
| **[openauth-react](https://github.com/shpaw415/openauth-react)** | `openauth-react` | React integration for client-side authentication | 🚧 WIP |

### Documentation

| Repository                                                           | Workspace Folder   | Description                 |
| -------------------------------------------------------------------- | ------------------ | --------------------------- |
| **[openauthster-doc](https://github.com/shpaw415/openauthster-doc)** | `openauthster-doc` | Official documentation site |

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
