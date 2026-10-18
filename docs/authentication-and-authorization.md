# Authentication and authorization (backend)

How the ASP.NET Core API in [`backend/`](../backend/README.md) authenticates users and decides what they may do. This is
the real implementation; the Angular app does not call it yet and still uses the mock described in
[architecture.md](architecture.md#authentication-and-authorization).

## Tokens

| Token | Form | Lifetime | Stored |
|---|---|---|---|
| Access token | JWT, HMAC-SHA256, claims `sub`, `name`, `email`, `role` | 15 minutes | Not stored; the client keeps it in memory |
| Refresh token | 256 random bits, URL-safe | 30 days with "Remember me", otherwise 12 hours | Only its SHA-256 hash, with the user, expiry and revoked time |
| Reset token | 256 random bits, URL-safe | 60 minutes, single use | Only its SHA-256 hash |

Random tokens are hashed with a fast hash rather than a password hash because they carry 256 bits of entropy; there is
nothing to brute-force. A leaked database file therefore reveals no usable token.

## Sign-in and refresh

```
Client                                   API
  │ POST /auth/login {login, password, rememberMe}
  ├──────────────────────────────────────►│ find user by username or email
  │                                       │ verify PBKDF2 hash (a decoy hash if no such user)
  │◄──────────────────────────────────────┤ access JWT + refresh token
  │ GET /users  Authorization: Bearer <jwt>
  ├──────────────────────────────────────►│ validate signature, issuer, audience, expiry, role policy
  │ ... access token expires ...
  │ POST /auth/refresh {refreshToken}
  ├──────────────────────────────────────►│ revoke the old token, issue a new pair
  │◄──────────────────────────────────────┤ new access JWT + new refresh token
```

- **Rotation with reuse detection.** Each refresh revokes the token it was given. If a token that was already revoked
  comes back, someone has a copy, so every session of that user is revoked.
- **Remember me** only changes the refresh token's lifetime. The choice is kept on the token and carried through
  rotations.
- **Unknown, disabled and wrong-password accounts get the same `401`** with the same message, and unknown accounts
  still spend a password hash so response time does not reveal which usernames exist.
- **Rehashing.** ASP.NET Core's hasher can report that a stored hash uses outdated parameters; the next successful sign-in
  stores a fresh hash.

## Password reset

1. `POST /auth/forgot-password {login}` always answers `202`. If the account exists and is active, a token is created, its
   hash stored (replacing any earlier unused one for that user) and the token is handed to `IPasswordResetNotifier`.
2. `POST /auth/reset-password {token, newPassword}` consumes the token in one step: unknown, used and expired tokens all
   get the same `400`, and two requests with the same token cannot both succeed.
3. A successful reset revokes every refresh token of the user, so an attacker who had the old password is signed out.

The notifier is a stand-in (`LoggingPasswordResetNotifier`): it logs the token in Development only, because a reset
token in a production log would be a credential. Replacing it with an email sender is the only change needed to ship
the flow.

## Roles and policies

| Role | Created by | Can |
|---|---|---|
| `customer` | Self-registration | Reach the authenticated endpoints |
| `agent` | An admin | Same as customer for now; agent-only endpoints arrive with orders |
| `admin` | An admin (the first one is seeded) | Everything, including `GET/POST /users` |

- **Secure by default.** A fallback authorization policy requires a signed-in user on every endpoint. Public endpoints
  opt out with `[AllowAnonymous]`, so a new controller cannot be exposed by forgetting an attribute.
- **Self-registration cannot choose a role.** `RegisterRequest` has no role field; the service sets `customer`.
- **Roles come from the token, signed by the server.** A forged token with `"role": "admin"` fails signature
  validation (there is a test for it). The policy is `AdminOnly` (`Policies.AdminOnly`); more are added when endpoints
  need them.

## Other protections

| Concern | Measure |
|---|---|
| Brute force and enumeration | Per-IP rate limit (10 requests a minute by default) on login, register, forgot- and reset-password |
| Token substitution | Issuer, audience, lifetime and algorithm (`HS256` only) are validated; 30 seconds of clock skew |
| Weak configuration | The signing key must be at least 32 characters; the app refuses to start otherwise |
| Credentials in transit | HTTPS redirection, and HSTS outside Development |
| Cross-origin calls | CORS allows one configured origin |
| Secrets in the repo | `.env` is git-ignored; `.env.example` lists the keys with no values |
| Data at rest | The JSON file holds PBKDF2 password hashes and token hashes, never a password or token |
| Error detail | Problem-details responses carry messages written for callers; exceptions are not echoed |

## Known gaps

- **Refresh tokens travel in the response body.** An HTTP-only cookie would keep them out of reach of injected script,
  but a cookie across `localhost:4200` and `localhost:5199` needs `SameSite`/credentials CORS handling. The frontend
  migration should decide this together with where it stores tokens.
- **Rate limiting keys on the connection's IP.** Behind a reverse proxy that would be the proxy's address; forwarded
  headers need configuring before deployment.
- **Expired and revoked tokens are never deleted** from the JSON file. A real database would purge them on a schedule.
- **One process only.** The JSON store serialises access with an in-process lock, so it must not be shared by two
  instances.
- **No email provider, no account lockout, no multi-factor sign-in.**
