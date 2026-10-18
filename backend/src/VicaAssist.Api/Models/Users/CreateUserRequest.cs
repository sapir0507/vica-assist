using System.ComponentModel.DataAnnotations;
using VicaAssist.Api.Enums;

namespace VicaAssist.Api.Models.Users;

/// <param name="Password">The initial password; the admin hands it to the new user, who can change it through the reset flow.</param>
public sealed record CreateUserRequest(
    [Required, StringLength(50, MinimumLength = 3)] string Username,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password,
    [EnumDataType(typeof(Role))] Role Role);
