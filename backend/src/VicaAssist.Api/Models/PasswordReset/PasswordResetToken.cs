namespace VicaAssist.Api.Models.PasswordReset;

/// <param name="TokenHash">SHA-256 of the token; the token itself is never stored.</param>
public sealed record PasswordResetToken(
    string TokenHash,
    int UserId,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? UsedAt);
