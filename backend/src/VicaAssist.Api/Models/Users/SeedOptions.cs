using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Users;

public sealed class SeedOptions
{
    /// <summary>Password given to every seeded user. Only needed while the database has no users.</summary>
    [MinLength(8)]
    public string? Password { get; init; }
}
