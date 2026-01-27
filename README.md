# OpenAuthster

A multi-tenant authentication server built with [OpenAuth](https://openauth.js.org/), designed for Cloudflare Workers with a complete Web UI for project orchestration.

## Overview

OpenAuthster provides developers with a ready-to-deploy authentication solution featuring:

- 🔐 **OpenAuth Issuer Server** - Secure authentication powered by OpenAuth
- 🏢 **Multi-Tenant Support** - Manage multiple projects/applications from a single deployment
- 🎨 **Web UI Dashboard** - Configure themes, providers, and project settings
- ☁️ **Cloudflare Workers** - Edge-deployed for low latency worldwide
- 📦 **Containerized Controls** - Secure and isolated project management out of the box

## Repository Structure

OpenAuthster is a **multi-repo project** consisting of the following repositories:

### Core Repositories

| Repository                                                                 | Description                                                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **[OpenAuthSter-server](https://github.com/shpaw415/OpenAuthSter-issuer)** | Cloudflare Worker containing the OpenAuth issuer server with multi-tenant capabilities               |
| **[OpenAuthSter-webui](https://github.com/shpaw415/OpenAuthSter-webUI)**   | Web UI dashboard for managing projects, customizing themes, and configuring authentication providers |
| **[OpenAuthSter-shared](https://github.com/shpaw415/OpenAuthSter-shared)** | Shared TypeScript types, components, and client-side code for connecting to the OpenAuthster issuer  |

### Client SDKs

| Repository                              | Description                                      | Status |
| --------------------------------------- | ------------------------------------------------ | ------ |
| **[openauth-react](../openauth-react)** | React integration for client-side authentication | 🚧 WIP |

## Getting Started

> Documentation coming soon

## License

> License information coming soon
