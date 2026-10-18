using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Interfaces;

public interface IPasswordResetNotifier
{
    Task SendAsync(User user, string resetToken, CancellationToken cancellationToken);
}
