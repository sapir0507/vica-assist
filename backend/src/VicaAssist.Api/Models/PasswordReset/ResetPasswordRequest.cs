using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.PasswordReset;

public sealed record ResetPasswordRequest(
    [Required] string Token,
    [Required, StringLength(128, MinimumLength = 8)] string NewPassword);
