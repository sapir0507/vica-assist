# VicaAssist backend

An ASP.NET Core (.NET 10) Web API that will replace the `json-server` mock. This first milestone covers
**authentication and authorization**: registration, sign-in with JWT access and refresh tokens, password reset, and
role-protected user management. The Angular app does not use it yet and still talks to the mock.

For the design behind it see [../docs/authentication-and-authorization.md](../docs/authentication-and-authorization.md)
and [../docs/decisions.md](../docs/decisions.md).

## Run it

Prerequisite: the [.NET 10 SDK](https://dotnet.microsoft.com/download) (Visual Studio 2026 includes it).

```bash
cd backend/src/VicaAssist.Api
cp .env.example .env     # then set Jwt__SigningKey and Seed__Password
dotnet run               # http://localhost:5199, Swagger UI at /swagger
```

Or open `backend/VicaAssist.slnx` in Visual Studio and run the `https` profile. On the first start the database file
`App_Data/database.json` is created and filled with the sample users from `Seed/seed-users.json`
(`admin`, `livetotell`, `agent.noam`, `sapir0507`, `Blabla hotel`), all with the password from `Seed__Password`.

To try a protected endpoint in Swagger: `POST /api/v1/auth/login`, copy the `accessToken`, choose **Authorize** and
paste it.

The password reset sends no email yet. In Development the reset token is written to the console log; in any other
environment it is never logged, so the flow cannot be completed there until an email provider is added.

## Configuration

Settings come from `appsettings.json`, then the `.env` file, then real environment variables (which win over `.env`).
`__` stands for a section separator, so `Jwt__SigningKey` is `Jwt:SigningKey`. Invalid values stop the app at start-up.

| Key | Default | Meaning |
|---|---|---|
| `Jwt__SigningKey` | none, **required** | HMAC key, at least 32 characters |
| `Seed__Password` | none | Password for the seeded users; required while the database has no users |
| `Jwt__Issuer`, `Jwt__Audience` | `vica-assist-api`, `vica-assist-app` | Checked on every token |
| `Jwt__AccessTokenMinutes` | 15 | Access token lifetime |
| `Jwt__RefreshTokenDays` | 30 | Refresh token lifetime with "Remember me" |
| `Jwt__SessionRefreshTokenHours` | 12 | Refresh token lifetime without it |
| `Cors__AllowedOrigin` | `http://localhost:4200` | The one origin allowed to call the API from a browser |
| `Data__FilePath` | `App_Data/database.json` | The JSON database, relative to the project directory |
| `PasswordReset__TokenMinutes` | 60 | Reset token lifetime |
| `RateLimit__AuthRequestsPerMinute` | 10 | Per client IP, on login, register and the reset endpoints |

## Endpoints

All under `/api/v1`. Everything needs a bearer token unless marked public.

| Method and path | Access | Does |
|---|---|---|
| `POST /auth/register` | public | Creates a customer (does not sign in) |
| `POST /auth/login` | public | Username or email + password → access and refresh tokens |
| `POST /auth/refresh` | public | Swaps a refresh token for a new pair |
| `POST /auth/logout` | public | Revokes a refresh token |
| `POST /auth/forgot-password` | public | Starts a reset; always `202` |
| `POST /auth/reset-password` | public | Sets a new password with a reset token |
| `GET /auth/me` | any signed-in user | The current user |
| `GET /users` | admin | Lists users |
| `POST /users` | admin | Creates a user with any role |

Errors use RFC 9457 problem details; validation failures list the offending fields.

## Layout

```
backend/
  VicaAssist.slnx
  src/VicaAssist.Api/
    Controllers/     thin HTTP layer
    Services/        the use cases (sign-in, reset, user management) and the token and password helpers
    Interfaces/      contracts for services and repositories
    Repositories/    JSON-file implementations of the repository interfaces
    Models/          every class that only holds data, grouped by feature: Auth, Users, PasswordReset, Data.
                     That covers entities, request/response types, settings (JwtOptions, ...) and policy names
    Enums/           Role
    Authorization/   JWT bearer setup
    Exceptions/      ApiException and its problem-details handler
    Extensions/      service registration, the .env loader, the OpenAPI bearer scheme
    Seed/            sample users
  tests/VicaAssist.Api.Tests/
```

## Tests

```bash
cd backend
dotnet test VicaAssist.slnx
```

The tests start the real application against a temporary JSON file (`WebApplicationFactory`). Only the clock and the
reset-email sender are replaced, so the whole pipeline is exercised: validation, JWT checks, role policies, rate
limiting and persistence. CI runs the same command (`.github/workflows/backend.yml`).
