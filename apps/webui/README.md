# OpenAuthster WebUI

> ⚠️ **Work in Progress** - This project is under active development. Please [submit issues](https://github.com/shpaw415/openauth-webui/issues) if you encounter bugs or inconsistencies.

## Overview

OpenAuthster WebUI is the management dashboard for your [OpenAuthster](https://github.com/shpaw415/openauthster) authentication system. It provides an intuitive interface to:

- 🎨 **Customize Themes** - Brand your authentication pages
- 🔧 **Configure Providers** - Set up OAuth providers (Google, GitHub, etc.)
- 📊 **Manage Projects** - Orchestrate multiple applications from one dashboard

## Prerequisites

Before setting up the WebUI, you must first deploy the OpenAuthster issuer server:

👉 [OpenAuthster Issuer Setup](https://github.com/shpaw415/OpenAuthSter-issuer)

## Installation

### 1. Clone Repository

Clone this repository as a **private repository** (recommended for production):

```bash
# Clone the repository
git clone https://github.com/shpaw415/OpenAuthSter-webUI.git openauth-webui
cd openauth-webui

# If you want to maintain your own version, create a private repo
# and push this code to your private repository
```

> ⚠️ **Security Note:** Keep your WebUI repository private as it will contain configuration and environment-specific settings.

### 2. Configure Wrangler

Rename `wrangler.example.jsonc` to `wrangler.jsonc`, then update it with the following settings:

#### Database Binding

Add the D1 database from your OpenAuthster issuer deployment:

```json
{
  "d1_databases": [
    {
      "binding": "PROJECT_DB",
      "database_name": "<your-database-name>",
      "database_id": "<your-database-id>",
      "migrations_dir": "drizzle/migrations",
      "remote": true
    }
  ]
}
```

> 💡 You can find the `database_id` and `database_name` in your OpenAuthster issuer's `wrangler.json`

#### Environment Variables

Configure all required environment variables:

```json
{
  "vars": {
    "PUBLIC_REDIRECT_URI": "https://admin.yourdomain.com/",
    "PUBLIC_ISSUER": "https://auth.yourdomain.com",
    "CLOUDFLARE_API_TOKEN": "<your-cloudflare-api-token>",
    "CLOUDFLARE_ACCOUNT_ID": "<your-cloudflare-account-id>",
    "CLOUDFLARE_AUTH_DOMAIN_ZONE_ID": "<your-zone-id>",
    "CLOUDFLARE_WORKER_SERVICE_NAME": "<your-worker-service-name>",
    "CLOUDFLARE_AUTH_ENDPOINT_DOMAIN": "auth.yourdomain.com",
    "BUN_VERSION": "1.3.4",
    "SKIP_DEPENDENCY_INSTALL": "true",
    "PUBLIC_CLIENT_ID": "openauth_webui"
  }
}
```

**Configuration Details:**

| Variable                          | Required | Description                                            | Example                                                                         |
| --------------------------------- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `PUBLIC_ISSUER`                   | Yes      | OpenAuthster issuer URL                                | `https://auth.yourdomain.com`                                                   |
| `PUBLIC_REDIRECT_URI`             | Yes      | WebUI callback URL (must end with `/`)                 | `https://admin.yourdomain.com/`                                                 |
| `CLOUDFLARE_API_TOKEN`            | Yes      | API token with Workers management permissions          | Get from [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID`           | Yes      | Your Cloudflare account ID                             | Found in Cloudflare Dashboard URL                                               |
| `CLOUDFLARE_AUTH_DOMAIN_ZONE_ID`  | Yes      | Zone ID for the auth domain                            | Found in domain overview                                                        |
| `CLOUDFLARE_WORKER_SERVICE_NAME`  | Yes      | Name of your issuer Worker                             | Same as `name` in issuer's wrangler.json                                        |
| `CLOUDFLARE_AUTH_ENDPOINT_DOMAIN` | No       | Custom auth endpoint domain (if different from issuer) | `auth.yourdomain.com`                                                           |
| `BUN_VERSION`                     | Yes      | Bun version (do not change)                            | `1.3.4`                                                                         |
| `SKIP_DEPENDENCY_INSTALL`         | Yes      | Skip dependency install (do not change)                | `true`                                                                          |
| `PUBLIC_CLIENT_ID`                | Yes      | WebUI client ID (do not change)                        | `openauth_webui`                                                                |

> **Note:** The last three variables (`BUN_VERSION`, `SKIP_DEPENDENCY_INSTALL`, `PUBLIC_CLIENT_ID`) should not be modified.

### 3. Deploy

Deploy to Cloudflare Pages:

1. **Create a private GitHub repository** and push your code:

   ```bash
   # Create a new private repository on GitHub
   # Then set it as your remote:
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_PRIVATE_REPO.git
   git push -u origin main
   ```

2. **Create a Cloudflare Pages project:**

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your private repository

3. **Configure build settings:**

   - **Build command:** `bun install --frozen-lockfile && NODE_ENV=production bun run build`
   - **Build output directory:** `.frame-master/build`
   - **Root directory:** (leave empty)

4. **Add environment variables in Cloudflare Pages settings:**

   Add all required variables from your `wrangler.jsonc`:

   - `PUBLIC_ISSUER`
   - `PUBLIC_REDIRECT_URI`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_AUTH_DOMAIN_ZONE_ID`
   - `CLOUDFLARE_WORKER_SERVICE_NAME`
   - `CLOUDFLARE_AUTH_ENDPOINT_DOMAIN` (optional)
   - `BUN_VERSION`
   - `SKIP_DEPENDENCY_INSTALL`
   - `PUBLIC_CLIENT_ID`

   > See the configuration table in step 2 for details on each variable.

5. **Deploy!**

## Development Setup

For local development and contributing to the WebUI:

### Requirements

- [Bun.js](https://bun.sh) - Fast JavaScript runtime and package manager

### Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment**

   Create a `.env` file with your local configuration:

   ```env
   # Required - Issuer Configuration
   PUBLIC_ISSUER=http://localhost:8787
   PUBLIC_REDIRECT_URI=http://localhost:8788/

   # Required - Cloudflare Configuration
   CLOUDFLARE_API_TOKEN=your_api_token_here
   CLOUDFLARE_ACCOUNT_ID=your_account_id_here
   CLOUDFLARE_AUTH_DOMAIN_ZONE_ID=your_zone_id_here
   CLOUDFLARE_WORKER_SERVICE_NAME=openauthster-issuer

   # Optional - Custom Auth Domain
   CLOUDFLARE_AUTH_ENDPOINT_DOMAIN=auth.yourdomain.com

   # Do not change these
   BUN_VERSION=1.3.4
   SKIP_DEPENDENCY_INSTALL=true
   PUBLIC_CLIENT_ID=openauth_webui
   ```

3. **Start development server**

   ```bash
   bun dev
   ```

## Project Structure

```
openauth-webui/             # (GitHub: OpenAuthSter-webUI)
├── src/                    # Application source code
├── functions/              # Cloudflare Pages Functions (API routes) - generated during build
├── static/                 # Static assets
├── drizzle/                # Database migrations
├── wrangler.jsonc          # Cloudflare configuration
└── frame-master.config.ts  # Build configuration
```

## Related Repositories

- [OpenAuthster](https://github.com/shpaw415/openauthster) – Main project documentation
- [OpenAuthster Issuer](https://github.com/shpaw415/OpenAuthSter-issuer) – Authentication server
- [Shared Types](https://github.com/shpaw415/OpenAuthSter-shared) – TypeScript types and client SDK
- [React SDK](https://github.com/shpaw415/openauth-react) – React integration (WIP)

## License

> License information coming soon
