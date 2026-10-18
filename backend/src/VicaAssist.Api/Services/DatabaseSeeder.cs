using System.Text.Json;
using Microsoft.Extensions.Options;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Services;

/// <summary>Creates the sample users from <c>Seed/seed-users.json</c> when the database has no users yet.</summary>
public sealed class DatabaseSeeder(
    IUserRepository users,
    PasswordService passwords,
    IOptions<SeedOptions> options,
    TimeProvider timeProvider,
    ILogger<DatabaseSeeder> logger) : IHostedService
{
    private sealed record SeedUser(string Username, string Email, Role Role);

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if ((await users.ListAsync(cancellationToken)).Count > 0)
        {
            return;
        }

        var password = options.Value.Password
            ?? throw new InvalidOperationException(
                "The database has no users. Set Seed:Password (Seed__Password) so the sample users can be created.");

        var seedPath = Path.Combine(AppContext.BaseDirectory, "Seed", "seed-users.json");
        var seedUsers = JsonSerializer.Deserialize<List<SeedUser>>(
            await File.ReadAllTextAsync(seedPath, cancellationToken), JsonSerializerOptions.Web) ?? [];

        foreach (var seedUser in seedUsers)
        {
            await users.TryAddAsync(
                seedUser.Username, seedUser.Email, passwords.Hash(password), seedUser.Role,
                timeProvider.GetUtcNow(), cancellationToken);
        }

        logger.LogInformation("Seeded {Count} users.", seedUsers.Count);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
