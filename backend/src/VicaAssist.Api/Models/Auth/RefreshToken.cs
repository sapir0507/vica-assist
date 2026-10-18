namespace VicaAssist.Api.Models.Auth;

/// <param name="TokenHash">SHA-256 of the token; the token itself is never stored.</param>
/// <param name="Persistent">True when the user ticked "Remember me", which gives the token the longer lifetime.</param>
public sealed record RefreshToken(
    string TokenHash,
    int UserId,
    DateTimeOffset ExpiresAt,
    bool Persistent,
    DateTimeOffset? RevokedAt);
