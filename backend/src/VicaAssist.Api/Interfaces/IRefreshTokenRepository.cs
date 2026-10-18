using VicaAssist.Api.Models.Auth;

namespace VicaAssist.Api.Interfaces;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken token, CancellationToken cancellationToken);

    Task<RefreshToken?> FindByHashAsync(string tokenHash, CancellationToken cancellationToken);

    Task RevokeAsync(string tokenHash, DateTimeOffset revokedAt, CancellationToken cancellationToken);

    Task RevokeAllForUserAsync(int userId, DateTimeOffset revokedAt, CancellationToken cancellationToken);
}
