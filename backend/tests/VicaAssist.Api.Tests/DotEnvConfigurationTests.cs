using Microsoft.Extensions.Configuration;
using VicaAssist.Api.Extensions;

namespace VicaAssist.Api.Tests;

public sealed class DotEnvConfigurationTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.env");

    public void Dispose() => File.Delete(_path);

    private IConfiguration Load(string contents)
    {
        File.WriteAllText(_path, contents);
        return new ConfigurationBuilder().AddDotEnvFile(_path).Build();
    }

    [Fact]
    public void Values_become_configuration_with_double_underscores_as_section_separators()
    {
        var configuration = Load("""
            # a comment

            Jwt__Issuer=my-issuer
            Cors__AllowedOrigin = "http://localhost:4200"
            Seed__Password='quoted value'
            """);

        Assert.Equal("my-issuer", configuration["Jwt:Issuer"]);
        Assert.Equal("http://localhost:4200", configuration["Cors:AllowedOrigin"]);
        Assert.Equal("quoted value", configuration["Seed:Password"]);
    }

    [Fact]
    public void A_value_may_contain_equals_signs()
    {
        var configuration = Load("Jwt__SigningKey=abc==def");

        Assert.Equal("abc==def", configuration["Jwt:SigningKey"]);
    }

    [Fact]
    public void A_variable_set_in_the_real_environment_wins_over_the_file()
    {
        const string variable = "VICA_TEST_DOTENV_PRECEDENCE";
        Environment.SetEnvironmentVariable(variable, "from-environment");
        try
        {
            var configuration = Load($"{variable}=from-file");

            Assert.Null(configuration[variable]);
        }
        finally
        {
            Environment.SetEnvironmentVariable(variable, null);
        }
    }

    [Fact]
    public void A_missing_file_is_ignored()
    {
        var configuration = new ConfigurationBuilder().AddDotEnvFile(_path).Build();

        Assert.Empty(configuration.AsEnumerable());
    }

    [Fact]
    public void A_line_without_a_key_and_value_is_reported_with_its_line_number()
    {
        var failure = Assert.Throws<FormatException>(() => Load("Valid__Key=1\nthis is not valid"));

        Assert.Contains("line 2", failure.Message);
    }
}
