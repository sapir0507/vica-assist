using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

/// <param name="Login">Username or email.</param>
/// <param name="RememberMe">Gives the refresh token the long lifetime instead of the session one.</param>
public sealed record LoginRequest(
    [Required, StringLength(254)] string Login,
    [Required, StringLength(128)] string Password,
    bool RememberMe = false);
