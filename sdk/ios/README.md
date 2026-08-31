# OpenAuthster iOS SDK

Swift Package for **public** OpenAuthster clients (PKCE, Keychain, `ASWebAuthenticationSession`).

Do not put `project.secret` in the app. Register `clientType: "public"` and this redirect URI on the issuer project.

```swift
.package(url: "https://github.com/shpaw415/OpenAuthSter.git", from: "1.0.2")
```

Target path: `sdk/ios`.
