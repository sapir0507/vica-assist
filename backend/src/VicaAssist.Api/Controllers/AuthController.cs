using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;
using VicaAssist.Api.Authorization;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService, IPasswordResetService passwordResetService) : ControllerBase
{
    /// <summary>Creates a customer account. It does not sign the user in.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var user = await authService.RegisterAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, user);
    }

    /// <summary>Signs in with a username or email and returns an access token and a refresh token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    public Task<AuthResponse> Login(LoginRequest request, CancellationToken cancellationToken) =>
        authService.LoginAsync(request, cancellationToken);

    /// <summary>Swaps a refresh token for a new access token and a new refresh token. The old refresh token stops working.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public Task<AuthResponse> Refresh(RefreshTokenRequest request, CancellationToken cancellationToken) =>
        authService.RefreshAsync(request.RefreshToken, cancellationToken);

    /// <summary>Revokes a refresh token. Works with an expired access token, and with a token that is already revoked.</summary>
    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<NoContentResult> Logout(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(request.RefreshToken, cancellationToken);
        return NoContent();
    }

    /// <summary>Starts a password reset. Always answers 202, whether or not the account exists.</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    public async Task<AcceptedResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await passwordResetService.RequestResetAsync(request, cancellationToken);
        return Accepted();
    }

    /// <summary>Sets a new password using the token from the reset link. A token works once.</summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.Auth)]
    public async Task<NoContentResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await passwordResetService.ResetPasswordAsync(request, cancellationToken);
        return NoContent();
    }

    /// <summary>Returns the signed-in user.</summary>
    [HttpGet("me")]
    public Task<UserResponse> Me(CancellationToken cancellationToken) =>
        authService.GetCurrentUserAsync(int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!), cancellationToken);
}
