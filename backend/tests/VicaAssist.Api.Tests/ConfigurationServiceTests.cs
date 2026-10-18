using VicaAssist.Api.Services;

namespace VicaAssist.Api.Tests;

public sealed class ConfigurationServiceTests : IDisposable
{
    private const string ValidBaseSettings = """
        {
          // comments are allowed
          "Jwt": {
            "SigningKey": "base-signing-key-0123456789-abcdefghijkl",
            "Issuer": "base-issuer",
            "Audience": "base-audience",
            "AccessTokenMinutes": 15,
            "RefreshTokenDays": 30,
            "SessionRefreshTokenHours": 12
          },
          "Cors": { "AllowedOrigin": "http://localhost:4200" },
          "Data": { "FilePath": "App_Data/database.json" },
          "PasswordReset": { "TokenMinutes": 60 },
          "RateLimit": { "AuthRequestsPerMinute": 10 }
        }
        """;

    private static readonly IReadOnlyDictionary<string, string?> NoVariables = new Dictionary<string, string?>();

    private readonly string _directory = Path.Combine(Path.GetTempPath(), "vica-assist-tests", Guid.NewGuid().ToString("N"));

    public ConfigurationServiceTests()
    {
        Directory.CreateDirectory(_directory);
    }

    public void Dispose() => Directory.Delete(_directory, recursive: true);

    private void Write(string fileName, string contents) => File.WriteAllText(Path.Combine(_directory, fileName), contents);

    private ConfigurationService Load(string environmentName = "Development", IReadOnlyDictionary<string, string?>? variables = null) =>
        new(_directory, environmentName, variables ?? NoVariables);

    [Fact]
    public void Settings_are_read_from_appsettings_json_and_comments_are_tolerated()
    {
        Write("appsettings.json", ValidBaseSettings);

        var settings = Load().Settings;

        Assert.Equal("base-issuer", settings.Jwt.Issuer);
        Assert.Equal(15, settings.Jwt.AccessTokenMinutes);
        Assert.Equal("http://localhost:4200", settings.Cors.AllowedOrigin);
        Assert.Null(settings.Seed.Password);
    }

    [Fact]
    public void The_file_for_the_current_environment_overrides_the_base_file_and_other_environments_are_ignored()
    {
        Write("appsettings.json", ValidBaseSettings);
        Write("appsettings.Development.json", """{ "Jwt": { "AccessTokenMinutes": 60 } }""");

        var development = Load("Development").Settings.Jwt;
        var production = Load("Production").Settings.Jwt;

        Assert.Equal(60, development.AccessTokenMinutes);
        Assert.Equal("base-issuer", development.Issuer);
        Assert.Equal(15, production.AccessTokenMinutes);
    }

    [Fact]
    public void The_env_file_overrides_the_json_files()
    {
        Write("appsettings.json", ValidBaseSettings);
        Write("appsettings.Development.json", """{ "Jwt": { "Issuer": "development-issuer" } }""");
        Write(".env", "Jwt__Issuer=env-file-issuer\nSeed__Password=\"from the env file\"");

        var settings = Load().Settings;

        Assert.Equal("env-file-issuer", settings.Jwt.Issuer);
        Assert.Equal("from the env file", settings.Seed.Password);
    }

    [Fact]
    public void Environment_variables_override_the_env_file_and_keys_are_case_insensitive()
    {
        Write("appsettings.json", ValidBaseSettings);
        Write(".env", "Jwt__Issuer=env-file-issuer");
        var variables = new Dictionary<string, string?> { ["JWT__ISSUER"] = "variable-issuer" };

        Assert.Equal("variable-issuer", Load(variables: variables).Settings.Jwt.Issuer);
    }

    [Fact]
    public void Text_overrides_are_converted_to_the_type_of_the_setting()
    {
        Write("appsettings.json", ValidBaseSettings);
        var variables = new Dictionary<string, string?> { ["Jwt__AccessTokenMinutes"] = "5", ["Unrelated__Thing"] = "ignored", ["PATH"] = "ignored" };

        Assert.Equal(5, Load(variables: variables).Settings.Jwt.AccessTokenMinutes);
    }

    [Fact]
    public void Invalid_settings_are_all_reported_with_their_names()
    {
        Write("appsettings.json", ValidBaseSettings);
        var variables = new Dictionary<string, string?> { ["Jwt__SigningKey"] = "too-short", ["Jwt__AccessTokenMinutes"] = "0" };

        var failure = Assert.Throws<InvalidOperationException>(() => Load(variables: variables));

        Assert.Contains("Jwt:SigningKey", failure.Message);
        Assert.Contains("Jwt:AccessTokenMinutes", failure.Message);
    }

    [Fact]
    public void A_missing_section_is_reported_instead_of_silently_defaulting()
    {
        Write("appsettings.json", """{ "Jwt": { "SigningKey": "base-signing-key-0123456789-abcdefghijkl" } }""");

        var failure = Assert.Throws<InvalidOperationException>(() => Load());

        Assert.Contains("Data:FilePath", failure.Message);
    }

    [Fact]
    public void A_missing_appsettings_json_is_reported_with_its_path()
    {
        var failure = Assert.Throws<InvalidOperationException>(() => Load());

        Assert.Contains(Path.Combine(_directory, "appsettings.json"), failure.Message);
    }

    [Fact]
    public void A_file_that_is_not_valid_json_is_reported_with_its_path()
    {
        Write("appsettings.json", "{ not json");

        var failure = Assert.Throws<InvalidOperationException>(() => Load());

        Assert.Contains("appsettings.json", failure.Message);
    }
}
