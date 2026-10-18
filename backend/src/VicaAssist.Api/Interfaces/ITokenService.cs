using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Interfaces;

public interface ITokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateAccessToken(User user);
}
