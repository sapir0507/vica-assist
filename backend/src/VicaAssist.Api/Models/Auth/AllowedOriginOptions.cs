using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

public sealed class AllowedOriginOptions
{
    [Required]
    public string AllowedOrigin { get; init; } = "";
}
