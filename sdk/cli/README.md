# OpenAuthster CLI SDK

TypeScript client for **public** CLI apps. It uses the same authorization-code flow as the browser client: PKCE, access token, and refresh token. The callback is an RFC 8252 loopback listener on `127.0.0.1`.

Do not put `project.secret` in the CLI. Set `clientType: "public"` on the issuer project. Loopback `http://127.0.0.1` and `http://localhost` redirects are already allowed.

```ts
import { OpenAuthsterCliClient } from "openauthster-shared/client/cli";

const auth = new OpenAuthsterCliClient({
  issuer: "https://auth.example.com",
  clientID: "my_cli",
});

await auth.login();
const access = await auth.getValidAccessToken();
```

Tokens default to `~/.openauthster/<clientID>.json` (`0600`). Dashboard guide: `/dashboard/sdks`.
