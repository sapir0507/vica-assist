using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.PasswordReset;

/// <param name="Login">Username or email.</param>
public sealed record ForgotPasswordRequest([Required, StringLength(254)] string Login);
