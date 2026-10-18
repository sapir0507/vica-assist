using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Configuration;

public sealed class PasswordResetOptions
{
    public const string SectionName = "PasswordReset";

    [Range(1, 1440)]
    public int TokenMinutes { get; init; } = 60;
}
