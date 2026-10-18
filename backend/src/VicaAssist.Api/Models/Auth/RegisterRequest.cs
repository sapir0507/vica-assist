using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

public sealed record RegisterRequest(
    [Required, StringLength(50, MinimumLength = 3)] string Username,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password);
