using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;
using VicaAssist.Api.Interfaces;

namespace VicaAssist.Api.Tests.Support;

/// <summary>
/// Runs the real application against a throwaway JSON database. Only the clock and the reset-email sender are
/// replaced. Tests that move the clock need their own factory, because access tokens are checked against real time.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string SeedPassword = "TestPassw0rd!";

    private readonly string _workingDirectory = Path.Combine(Path.GetTempPath(), "vica-assist-tests", Guid.NewGuid().ToString("N"));
    private readonly string _dataFilePath;

    // xUnit builds class fixtures through a parameterless constructor.
    public ApiFactory()
    {
        Directory.CreateDirectory(_workingDirectory);
        _dataFilePath = Path.Combine(_workingDirectory, "database.json");
    }

    /// <summary>Uses an existing database file, to check that data survives a restart. Internal because xUnit allows one public constructor.</summary>
    internal ApiFactory(string dataFilePath)
    {
        Directory.CreateDirectory(_workingDirectory);
        _dataFilePath = dataFilePath;
    }

    public FakeTimeProvider Time { get; } = new(DateTimeOffset.UtcNow);

    public CapturingPasswordResetNotifier ResetNotifier { get; } = new();

    public string DataFilePath => _dataFilePath;

    public string SigningKey { get; init; } = "test-signing-key-0123456789-abcdefghijkl";

    public string? SeedPasswordSetting { get; init; } = SeedPassword;

    public int AuthRequestsPerMinute { get; init; } = 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // A developer's own .env sits in the project directory; a separate content root keeps it out of the tests.
        builder.UseContentRoot(_workingDirectory);
        builder.UseSetting("Jwt:SigningKey", SigningKey);
        builder.UseSetting("Data:FilePath", _dataFilePath);
        builder.UseSetting("RateLimit:AuthRequestsPerMinute", AuthRequestsPerMinute.ToString());
        if (SeedPasswordSetting is not null)
        {
            builder.UseSetting("Seed:Password", SeedPasswordSetting);
        }

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(Time);
            services.RemoveAll<IPasswordResetNotifier>();
            services.AddSingleton<IPasswordResetNotifier>(ResetNotifier);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && Directory.Exists(_workingDirectory))
        {
            Directory.Delete(_workingDirectory, recursive: true);
        }
    }
}
