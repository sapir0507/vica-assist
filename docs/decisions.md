# Decisions

Short records of the backend choices that were not obvious, with the reason and what was given up. The frontend
decisions are in [architecture.md](architecture.md#design-and-engineering-decisions).

## The backend lives in this repository

**Decision.** The ASP.NET Core API is in `backend/`, next to the Angular app, with its own solution and CI workflow.

**Why.** The project is presented as one full-stack application, and a change to an endpoint and to the code that calls
it can land in one commit. One clone runs everything.

**Given up.** The usual monorepo benefit, shared types, does not apply across C# and TypeScript, and Nx cannot build
.NET. The contract is the OpenAPI document the API publishes, from which the Angular side can generate its types.
Separate histories would also have kept frontend upgrade commits out of the backend log. CI uses path filters so a
frontend change does not build the backend.

## A REST API, not a json-server clone

**Decision.** Endpoints are designed around operations (`POST /auth/login`, `GET /auth/me`), not around the mock's
`?field=value` filtering.

**Why.** The mock's contract is the problem: credentials in a query string, `GET /login` returning the password, and
authorization decided in the browser. Copying it would carry those across. The Angular stores are migrated to the new
endpoints in a separate step.

## The built-in password hasher

**Decision.** Passwords are hashed with ASP.NET Core's `PasswordHasher` (PBKDF2 with a random salt and an upgradable
format) behind a small `PasswordService`.

**Why.** It ships with the framework, so there is no extra package to keep current, and it can report when a hash needs
upgrading, which the sign-in handles. Argon2 or bcrypt would be stronger against GPUs; swapping them in touches only
`PasswordService`.

## Access token plus rotating refresh token

**Decision.** Short-lived JWT access tokens (15 minutes) and opaque refresh tokens stored hashed, rotated on every use,
with reuse revoking all of the user's sessions.

**Why.** A stateless JWT cannot be revoked, so it is kept short; the refresh token is the revocable part. Opaque
refresh tokens, unlike JWTs, can be invalidated by deleting a row. "Remember me" maps to the refresh lifetime, which is
how the existing frontend already behaves (30 days or the tab).

## The JSON file store sits behind repository interfaces

**Decision.** `JsonFileStore` keeps the data in memory and writes one file atomically after each change under a single
lock; services depend on `IUserRepository` and its siblings.

**Why.** The database choice is postponed, and the interfaces mean choosing one later replaces `Repositories/` only.
Operations that must be atomic (adding a user only if the username is free, redeeming a reset token once) are single
repository methods so the lock covers the check and the write.

**Given up.** It is single-process and keeps expired tokens forever, which is acceptable for development.

## Settings through typed, validated options

**Decision.** Every setting is an options class with data annotations, bound with `ValidateOnStart`. A small loader
(`AddDotEnvFile`, about 40 lines) reads `.env`; real environment variables win over it.

**Why.** A missing or weak signing key should stop the app at start-up with a clear message, not surface as a failed
sign-in later. The loader avoids a dependency for a format this simple.

## Folder layout by layer

**Decision.** One project, with top-level folders by kind (`Controllers`, `Services`, `Interfaces`, `Repositories`,
`Models`, `Enums`). `Models` holds entities and request/response types together, grouped by feature (`Auth`, `Users`,
`PasswordReset`).

**Why.** It is the structure the author uses across .NET projects, and at this size a split into several assemblies
would add ceremony without a boundary anyone needs.

## The reset token is delivered by a logging stand-in

**Decision.** `LoggingPasswordResetNotifier` logs the token in Development and logs only a warning elsewhere.

**Why.** There is no email provider yet. Logging a reset token in production would put a credential in the logs, so the
flow is deliberately unusable there until a real sender implements `IPasswordResetNotifier`.
