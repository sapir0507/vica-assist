using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.PasswordReset;

namespace VicaAssist.Api.Repositories;

public sealed class JsonPasswordResetTokenRepository(JsonFileStore store) : IPasswordResetTokenRepository
{
    public Task ReplaceForUserAsync(PasswordResetToken token, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                database.PasswordResetTokens.RemoveAll(
                    existing => existing.UserId == token.UserId && existing.UsedAt is null);
                database.PasswordResetTokens.Add(token);
                return 0;
            },
            cancellationToken);

    public Task<PasswordResetToken?> TryConsumeAsync(
        string tokenHash, DateTimeOffset now, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                var index = database.PasswordResetTokens.FindIndex(token => token.TokenHash == tokenHash);
                if (index < 0)
                {
                    return null;
                }

                var token = database.PasswordResetTokens[index];
                if (token.UsedAt is not null || token.ExpiresAt <= now)
                {
                    return null;
                }

                var consumed = token with { UsedAt = now };
                database.PasswordResetTokens[index] = consumed;
                return consumed;
            },
            cancellationToken);
}
