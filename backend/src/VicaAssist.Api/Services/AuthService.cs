using Microsoft.AspNetCore.Identity;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Services;

public sealed class AuthService(
    IUserService userService,
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    ITokenService tokenService,
    PasswordService passwords,
    IConfigurationService configuration,
    TimeProvider timeProvider) : IAuthService
{
    private const string InvalidCredentials = "Invalid username or password.";
    private const string InvalidRefreshToken = "The refresh token is invalid or has expired.";

    private readonly JwtOptions _jwt = configuration.Settings.Jwt;

    public Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken) =>
        // Self-registration always creates a customer; agents and admins are created by an admin.
        userService.CreateAsync(
            new CreateUserRequest(request.Username, request.Email, request.Password, Role.Customer),
            cancellationToken);

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindByLoginAsync(request.Login.Trim(), cancellationToken);
        var verification = passwords.Verify(user?.PasswordHash, request.Password);

        // Unknown, disabled and wrong-password accounts all get the same answer.
        if (user is null || !user.Active || verification == PasswordVerificationResult.Failed)
        {
            throw ApiException.Unauthorized(InvalidCredentials);
        }

        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            await users.UpdatePasswordHashAsync(user.Id, passwords.Hash(request.Password), cancellationToken);
        }

        return await IssueTokensAsync(user, request.RememberMe, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var tokenHash = OpaqueToken.Hash(refreshToken);
        var stored = await refreshTokens.FindByHashAsync(tokenHash, cancellationToken)
            ?? throw ApiException.Unauthorized(InvalidRefreshToken);

        if (stored.RevokedAt is not null)
        {
            // A rotated-out token coming back means it was copied; end every session of that user.
            await refreshTokens.RevokeAllForUserAsync(stored.UserId, now, cancellationToken);
            throw ApiException.Unauthorized(InvalidRefreshToken);
        }

        var user = await users.FindByIdAsync(stored.UserId, cancellationToken);
        if (stored.ExpiresAt <= now || user is not { Active: true })
        {
            throw ApiException.Unauthorized(InvalidRefreshToken);
        }

        await refreshTokens.RevokeAsync(tokenHash, now, cancellationToken);
        return await IssueTokensAsync(user, stored.Persistent, cancellationToken);
    }

    public Task LogoutAsync(string refreshToken, CancellationToken cancellationToken) =>
        refreshTokens.RevokeAsync(OpaqueToken.Hash(refreshToken), timeProvider.GetUtcNow(), cancellationToken);

    public async Task<UserResponse> GetCurrentUserAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(userId, cancellationToken)
            ?? throw ApiException.Unauthorized("The account no longer exists.");
        return UserResponse.From(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, bool persistent, CancellationToken cancellationToken)
    {
        var (accessToken, accessTokenExpiresAt) = tokenService.CreateAccessToken(user);

        var refreshToken = OpaqueToken.Generate();
        var lifetime = persistent
            ? TimeSpan.FromDays(_jwt.RefreshTokenDays)
            : TimeSpan.FromHours(_jwt.SessionRefreshTokenHours);
        var refreshTokenExpiresAt = timeProvider.GetUtcNow().Add(lifetime);
        await refreshTokens.AddAsync(
            new RefreshToken(OpaqueToken.Hash(refreshToken), user.Id, refreshTokenExpiresAt, persistent, RevokedAt: null),
            cancellationToken);

        return new AuthResponse(
            accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, UserResponse.From(user));
    }
}
