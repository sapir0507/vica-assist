using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.PasswordReset;

namespace VicaAssist.Api.Services;

public sealed class PasswordResetService(
    IUserRepository users,
    IPasswordResetTokenRepository resetTokens,
    IRefreshTokenRepository refreshTokens,
    IPasswordResetNotifier notifier,
    IValidationService validation,
    PasswordService passwords,
    IConfigurationService configuration,
    TimeProvider timeProvider) : IPasswordResetService
{
    private const string InvalidToken = "The reset link is invalid or has expired.";

    public async Task RequestResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindByLoginAsync(request.Login.Trim(), cancellationToken);
        if (user is not { Active: true })
        {
            return;
        }

        var token = OpaqueToken.Generate();
        var expiresAt = timeProvider.GetUtcNow().AddMinutes(configuration.Settings.PasswordReset.TokenMinutes);
        await resetTokens.ReplaceForUserAsync(
            new PasswordResetToken(OpaqueToken.Hash(token), user.Id, expiresAt, UsedAt: null),
            cancellationToken);
        await notifier.SendAsync(user, token, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        // Before the token is redeemed, so a rejected password does not use the token up.
        await validation.ValidateAsync(request, cancellationToken);

        var now = timeProvider.GetUtcNow();
        var consumed = await resetTokens.TryConsumeAsync(OpaqueToken.Hash(request.Token), now, cancellationToken)
            ?? throw ApiException.BadRequest(InvalidToken);

        var user = await users.FindByIdAsync(consumed.UserId, cancellationToken);
        if (user is not { Active: true })
        {
            throw ApiException.BadRequest(InvalidToken);
        }

        await users.UpdatePasswordHashAsync(user.Id, passwords.Hash(request.NewPassword), cancellationToken);
        // Whoever held the old password may hold a refresh token too, so sign every device out.
        await refreshTokens.RevokeAllForUserAsync(user.Id, now, cancellationToken);
    }
}
