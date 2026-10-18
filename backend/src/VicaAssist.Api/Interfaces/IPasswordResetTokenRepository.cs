using VicaAssist.Api.Models.PasswordReset;

namespace VicaAssist.Api.Interfaces;

public interface IPasswordResetTokenRepository
{
    /// <summary>Stores the token and drops the user's earlier unused ones, so only the latest link works.</summary>
    Task ReplaceForUserAsync(PasswordResetToken token, CancellationToken cancellationToken);

    /// <summary>
    /// Marks the token as used and returns it, or returns null when it is unknown, already used or expired.
    /// Check and mark happen together so a token cannot be redeemed twice.
    /// </summary>
    Task<PasswordResetToken?> TryConsumeAsync(string tokenHash, DateTimeOffset now, CancellationToken cancellationToken);
}
