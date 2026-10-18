using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;
using Newtonsoft.Json;
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

    /// <summary>When set, Serilog writes a daily rolling file to this path (a name such as "api-.log"). Otherwise nothing is logged.</summary>
    public string? LogFilePath { get; init; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // The app reads its settings from files in the content root. Pointing that at a temporary directory with a
        // real appsettings.json exercises the production loading path and keeps a developer's own .env out of the tests.
        // (Real environment variables such as Jwt__SigningKey would still override these values.)
        builder.UseContentRoot(_workingDirectory);
        File.WriteAllText(
            Path.Combine(_workingDirectory, "appsettings.json"),
            JsonConvert.SerializeObject(new
            {
                Serilog = LogFilePath is null
                    ? null
                    : (object)new
                    {
                        Using = new[] { "Serilog.Sinks.File" },
                        MinimumLevel = new { Default = "Information", Override = new Dictionary<string, string> { ["Microsoft.AspNetCore"] = "Warning" } },
                        WriteTo = new[] { new { Name = "File", Args = new { path = LogFilePath, rollingInterval = "Day" } } }
                    },
                Jwt = new
                {
                    SigningKey,
                    Issuer = "vica-assist-api",
                    Audience = "vica-assist-app",
                    AccessTokenMinutes = 15,
                    RefreshTokenDays = 30,
                    SessionRefreshTokenHours = 12
                },
                Cors = new { AllowedOrigin = "http://localhost:4200" },
                Data = new { FilePath = _dataFilePath },
                Seed = new { Password = SeedPasswordSetting },
                PasswordReset = new { TokenMinutes = 60 },
                RateLimit = new { AuthRequestsPerMinute }
            }));

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
