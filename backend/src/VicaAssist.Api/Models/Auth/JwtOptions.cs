using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

public sealed class JwtOptions
{
    // HMAC-SHA256 needs at least a 256-bit key; 32 ASCII characters is 256 bits.
    [Required, MinLength(32)]
    public string SigningKey { get; init; } = "";

    [Required]
    public string Issuer { get; init; } = "";

    [Required]
    public string Audience { get; init; } = "";

    [Range(1, 1440)]
    public int AccessTokenMinutes { get; init; }

    /// <summary>Refresh token lifetime when the user ticked "Remember me".</summary>
    [Range(1, 365)]
    public int RefreshTokenDays { get; init; }

    /// <summary>Refresh token lifetime for a normal sign-in without "Remember me".</summary>
    [Range(1, 168)]
    public int SessionRefreshTokenHours { get; init; }
}
