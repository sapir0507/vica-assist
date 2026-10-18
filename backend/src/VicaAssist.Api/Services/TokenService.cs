using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Extensions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Services;

public sealed class TokenService(IConfigurationService configuration, TimeProvider timeProvider) : ITokenService
{
    private readonly JwtOptions _jwt = configuration.Settings.Jwt;
    private readonly JsonWebTokenHandler _handler = new();

    public (string Token, DateTimeOffset ExpiresAt) CreateAccessToken(User user)
    {
        var issuedAt = timeProvider.GetUtcNow();
        var expiresAt = issuedAt.AddMinutes(_jwt.AccessTokenMinutes);

        var token = _handler.CreateToken(new SecurityTokenDescriptor
        {
            Issuer = _jwt.Issuer,
            Audience = _jwt.Audience,
            IssuedAt = issuedAt.UtcDateTime,
            NotBefore = issuedAt.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("name", user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", user.Role.ToClaimValue())
            ]),
            SigningCredentials = new SigningCredentials(_jwt.CreateSigningKey(), SecurityAlgorithms.HmacSha256)
        });

        return (token, expiresAt);
    }
}
