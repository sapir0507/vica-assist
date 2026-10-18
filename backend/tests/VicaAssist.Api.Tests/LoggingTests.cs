using System.Net;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class LoggingTests : IDisposable
{
    private readonly string _directory = Path.Combine(Path.GetTempPath(), "vica-assist-tests", Guid.NewGuid().ToString("N"));

    public void Dispose() => Directory.Delete(_directory, recursive: true);

    /// <summary>
    /// Reads the log until it contains the text. The request line is written just after the response has been
    /// sent, and the logger still holds the file open, so reads share it and retry briefly.
    /// </summary>
    private async Task<string> ReadLogsContaining(string text)
    {
        var logs = "";
        for (var attempt = 0; attempt < 50 && !logs.Contains(text); attempt++)
        {
            await Task.Delay(50);
            var logFile = Directory.GetFiles(_directory, "api-*.log").SingleOrDefault();
            if (logFile is not null)
            {
                using var stream = new FileStream(logFile, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                logs = new StreamReader(stream).ReadToEnd();
            }
        }

        return logs;
    }

    [Fact]
    public async Task Requests_are_logged_to_the_file_configured_in_appsettings_without_the_credentials_sent()
    {
        using var factory = new ApiFactory { LogFilePath = Path.Combine(_directory, "api-.log") };
        var client = factory.CreateClient();

        var response = await client.TryLoginAsync("admin", "not-the-password");
        var logs = await ReadLogsContaining("POST /api/v1/auth/login responded 401");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains("POST /api/v1/auth/login responded 401", logs);
        Assert.DoesNotContain("not-the-password", logs);
    }

    [Fact]
    public async Task Seeding_is_logged_at_start_up()
    {
        using var factory = new ApiFactory { LogFilePath = Path.Combine(_directory, "api-.log") };
        factory.CreateClient();

        Assert.Contains("Seeded 5 users", await ReadLogsContaining("Seeded 5 users"));
    }
}
