using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.PasswordReset;

public sealed class PasswordResetOptions
{
    [Range(1, 1440)]
    public int TokenMinutes { get; init; }
}
