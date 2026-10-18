using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Data;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Models.Settings;

/// <summary>Everything the app reads from <c>appsettings*.json</c>, <c>.env</c> and the environment.</summary>
public sealed class AppSettings
{
    public JwtOptions Jwt { get; init; } = new();

    public AllowedOriginOptions Cors { get; init; } = new();

    public DataOptions Data { get; init; } = new();

    public SeedOptions Seed { get; init; } = new();

    public PasswordResetOptions PasswordReset { get; init; } = new();

    public RateLimitOptions RateLimit { get; init; } = new();
}
