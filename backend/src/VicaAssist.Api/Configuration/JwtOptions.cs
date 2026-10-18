using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace VicaAssist.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    // HMAC-SHA256 needs at least a 256-bit key; 32 ASCII characters is 256 bits.
    [Required, MinLength(32)]
    public string SigningKey { get; init; } = "";

    [Required]
    public string Issuer { get; init; } = "vica-assist-api";

    [Required]
    public string Audience { get; init; } = "vica-assist-app";

    [Range(1, 1440)]
    public int AccessTokenMinutes { get; init; } = 15;

    /// <summary>Refresh token lifetime when the user ticked "Remember me".</summary>
    [Range(1, 365)]
    public int RefreshTokenDays { get; init; } = 30;

    /// <summary>Refresh token lifetime for a normal sign-in without "Remember me".</summary>
    [Range(1, 168)]
    public int SessionRefreshTokenHours { get; init; } = 12;

    public SymmetricSecurityKey CreateSigningKey() => new(Encoding.UTF8.GetBytes(SigningKey));
}
