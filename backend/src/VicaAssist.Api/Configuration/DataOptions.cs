using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Configuration;

public sealed class DataOptions
{
    public const string SectionName = "Data";

    /// <summary>JSON database file. A relative path is resolved against the content root.</summary>
    [Required]
    public string FilePath { get; init; } = Path.Combine("App_Data", "database.json");
}
