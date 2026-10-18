using Microsoft.Extensions.Options;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class StartupAndPersistenceTests
{
    [Fact]
    public async Task Data_written_by_one_run_is_there_for_the_next()
    {
        var dataFile = Path.Combine(Path.GetTempPath(), "vica-assist-tests", $"{Guid.NewGuid():N}.json");
        try
        {
            using (var firstRun = new ApiFactory(dataFile))
            {
                await firstRun.CreateClient().RegisterAsync("survivor", "Sup3rSecret!");
            }

            using var secondRun = new ApiFactory(dataFile);
            var session = await secondRun.CreateClient().LoginAsync("survivor", "Sup3rSecret!");

            Assert.Equal("survivor", session.User.Username);
        }
        finally
        {
            File.Delete(dataFile);
        }
    }

    [Fact]
    public async Task The_stored_database_holds_password_hashes_and_never_the_password()
    {
        using var factory = new ApiFactory();
        await factory.CreateClient().RegisterAsync("hash-check", "Sup3rSecret!");

        var stored = await File.ReadAllTextAsync(factory.DataFilePath);

        Assert.Contains("hash-check", stored);
        Assert.DoesNotContain("Sup3rSecret!", stored);
        Assert.DoesNotContain(ApiFactory.SeedPassword, stored);
    }

    [Fact]
    public void Starting_with_a_signing_key_that_is_too_short_fails()
    {
        using var factory = new ApiFactory { SigningKey = "too-short" };

        var failure = Assert.Throws<OptionsValidationException>(() => factory.CreateClient());

        Assert.Contains("SigningKey", failure.Message);
    }

    [Fact]
    public void Starting_with_an_empty_database_and_no_seed_password_fails()
    {
        using var factory = new ApiFactory { SeedPasswordSetting = null };

        var failure = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("Seed:Password", failure.Message);
    }
}
