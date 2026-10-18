using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Data;

public sealed class DataOptions
{
    /// <summary>JSON database file. A relative path is resolved against the content root.</summary>
    [Required]
    public string FilePath { get; init; } = "";
}
