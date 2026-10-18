using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Interfaces;

public interface IAuthService
{
    Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);

    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken cancellationToken);

    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken);

    Task<UserResponse> GetCurrentUserAsync(int userId, CancellationToken cancellationToken);
}
