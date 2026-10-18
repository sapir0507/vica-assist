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

## Settings through a ConfigurationService

**Decision.** `ConfigurationService` reads `appsettings.json`, then `appsettings.<Environment>.json`, then `.env`, then
real environment variables, into one typed `AppSettings` object and validates it (data annotations) when the app
starts. Services depend on `IConfigurationService` instead of `IOptions<T>`. Defaults live in `appsettings.json`, not
in C# initialisers; secrets live in `.env`.

**Why.** One class shows the whole story of where a value comes from, with the order written down and tested, and it
is built from plain inputs (a directory, an environment name, a dictionary) so the tests exercise it without touching
the machine's environment. A missing or weak signing key stops the app with a message naming every invalid setting
(`Jwt:SigningKey`), instead of failing at the first sign-in.

**Given up.** The framework's configuration system, which also offers reload-on-change, user-secrets and cloud
providers. The framework still loads the same `appsettings` files for its own needs and for Serilog (below), so the
files are read twice. Settings in the `Serilog` section are therefore not overridden by `.env`.

## Newtonsoft.Json for all JSON

**Decision.** The controllers, the JSON database file, the seed data and the settings loader use Newtonsoft.Json
(`AddNewtonsoftJson`). Enums are written as their `[EnumMember]` names.

**Why.** It was requested as the project's JSON library, and one library avoids two sets of attributes and
conventions in the same code base.

**Given up.** The built-in OpenAPI generator is System.Text.Json based, so `EnumSchemaTransformer` rewrites enum
schemas to the names actually sent (a test checks the document). The framework's own problem-details writer for error
responses stays on System.Text.Json; it carries no enums or custom shapes. Newtonsoft adds a dependency, which the
project otherwise tries to avoid.

## Serilog, configured in appsettings

**Decision.** Serilog logs to the console and to a daily rolling file, with sinks, levels and path in the `Serilog`
section of `appsettings.json`. Requests are logged one line each by `UseSerilogRequestLogging`. A console-only bootstrap
logger covers failures before the configured one exists.

**Why.** Structured logs with a file give something to read after the process has gone. The request line carries
method, path, status and duration but never bodies or query strings, so credentials and tokens stay out of the log.
Each host keeps its own logger (`preserveStaticLogger`) rather than the process-wide `Log.Logger`, which keeps the
integration tests, which run several hosts in one process, from writing into each other's files.

**Given up.** Serilog reads the framework's `IConfiguration`, so it ignores `.env` (use a real environment variable
such as `Serilog__MinimumLevel__Default`). The relative log path follows the working directory, which is the project
folder under `dotnet run` and Visual Studio.

## A validation service and a validator factory, on top of the attributes

**Decision.** Rules that attributes cannot express are hand-written `IValidator<T>` classes in `Validators/`.
`ValidationService` asks `ValidatorFactory` for the validator registered for the request type, runs it, and throws
`ValidationFailedException`, which the exception handler turns into the same `400` problem-details shape MVC uses for
attribute failures. The attributes stay; the service runs inside the use-case services, after them.

**Why.** Attributes check one property at a time, with no access to the rest of the request or to data. The factory
keeps the service closed to change: a new rule set is a validator class plus one registration line, and the services
never name a concrete validator. The first rules close a real hole (a username shaped like an email address could
shadow another account at sign-in) and apply the same password policy to registration, admin-created users and resets.
Validation runs in `UserService` and `PasswordResetService`, not the controllers, so every entry point is covered once.

**Given up.** FluentValidation would provide the rule syntax and built-ins; hand-written validators avoid a dependency
for two small rule sets. "Username or email already taken" is deliberately not a validator rule: it must be atomic with
the insert (a pre-check would race), and a conflict is a `409`, not malformed input, so it stays in
`IUserRepository.TryAddAsync`.

## Folder layout by layer

**Decision.** One project, with top-level folders by kind (`Controllers`, `Services`, `Interfaces`, `Repositories`,
`Models`, `Enums`). A class that only holds data goes in `Models`, grouped by feature (`Auth`, `Users`, `PasswordReset`,
`Data`, `Settings`): entities, request and response types, the settings classes (`JwtOptions`, `RateLimitOptions`, ...) and the
constant policy names. Classes with behaviour stay in the folder for their layer.

**Why.** It is the structure the author uses across .NET projects, and at this size a split into several assemblies
would add ceremony without a boundary anyone needs. Keeping `Models` strictly data-only is why building the JWT signing
key is an extension method (`JwtOptionsExtensions`) rather than a method on `JwtOptions`.

## The reset token is delivered by a logging stand-in

**Decision.** `LoggingPasswordResetNotifier` logs the token in Development (so it reaches the log file too) and logs
only a warning elsewhere.

**Why.** There is no email provider yet. Logging a reset token in production would put a credential in the logs, so the
flow is deliberately unusable there until a real sender implements `IPasswordResetNotifier`.
