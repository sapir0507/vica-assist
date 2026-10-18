using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Services;

/// <summary>
/// Stand-in until an email provider is wired up. In Development it logs the token so the flow can be tried
/// from Swagger; elsewhere it never writes the token to the log.
/// </summary>
public sealed class LoggingPasswordResetNotifier(
    ILogger<LoggingPasswordResetNotifier> logger, IHostEnvironment environment) : IPasswordResetNotifier
{
    public Task SendAsync(User user, string resetToken, CancellationToken cancellationToken)
    {
        if (environment.IsDevelopment())
        {
            logger.LogInformation("Password reset token for {Username}: {Token}", user.Username, resetToken);
        }
        else
        {
            logger.LogWarning("No email provider is configured, so the password reset for {Username} was not delivered.", user.Username);
        }

        return Task.CompletedTask;
    }
}
