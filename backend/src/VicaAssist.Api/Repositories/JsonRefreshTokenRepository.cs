using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Auth;

namespace VicaAssist.Api.Repositories;

public sealed class JsonRefreshTokenRepository(JsonFileStore store) : IRefreshTokenRepository
{
    public Task AddAsync(RefreshToken token, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                database.RefreshTokens.Add(token);
                return 0;
            },
            cancellationToken);

    public Task<RefreshToken?> FindByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        store.ReadAsync(
            database => database.RefreshTokens.FirstOrDefault(token => token.TokenHash == tokenHash),
            cancellationToken);

    public Task RevokeAsync(string tokenHash, DateTimeOffset revokedAt, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                var index = database.RefreshTokens.FindIndex(token => token.TokenHash == tokenHash);
                if (index >= 0 && database.RefreshTokens[index].RevokedAt is null)
                {
                    database.RefreshTokens[index] = database.RefreshTokens[index] with { RevokedAt = revokedAt };
                }

                return 0;
            },
            cancellationToken);

    public Task RevokeAllForUserAsync(int userId, DateTimeOffset revokedAt, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                for (var index = 0; index < database.RefreshTokens.Count; index++)
                {
                    var token = database.RefreshTokens[index];
                    if (token.UserId == userId && token.RevokedAt is null)
                    {
                        database.RefreshTokens[index] = token with { RevokedAt = revokedAt };
                    }
                }

                return 0;
            },
            cancellationToken);
}
