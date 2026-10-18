using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Configuration;

public sealed class AllowedOriginOptions
{
    public const string SectionName = "Cors";

    [Required]
    public string AllowedOrigin { get; init; } = "http://localhost:4200";
}
