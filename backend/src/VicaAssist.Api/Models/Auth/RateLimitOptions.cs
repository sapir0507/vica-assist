using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    /// <summary>Requests per minute and client IP for the credential endpoints (login, register, password reset).</summary>
    [Range(1, 10_000)]
    public int AuthRequestsPerMinute { get; init; } = 10;
}
