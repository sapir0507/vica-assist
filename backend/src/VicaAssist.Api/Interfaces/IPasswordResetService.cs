using VicaAssist.Api.Models.PasswordReset;

namespace VicaAssist.Api.Interfaces;

public interface IPasswordResetService
{
    /// <summary>Sends a reset link when the account exists; says nothing either way so accounts cannot be probed.</summary>
    Task RequestResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);

    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
