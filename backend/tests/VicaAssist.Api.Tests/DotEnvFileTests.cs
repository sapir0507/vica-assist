using VicaAssist.Api.Services;

namespace VicaAssist.Api.Tests;

public sealed class DotEnvFileTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.env");

    public void Dispose() => File.Delete(_path);

    private IReadOnlyDictionary<string, string?> Read(string contents)
    {
        File.WriteAllText(_path, contents);
        return DotEnvFile.Read(_path);
    }

    [Fact]
    public void Keys_and_values_are_read_and_comments_blank_lines_and_quotes_are_handled()
    {
        var values = Read("""
            # a comment

            Jwt__Issuer=my-issuer
            Cors__AllowedOrigin = "http://localhost:4200"
            Seed__Password='quoted value'
            """);

        Assert.Equal("my-issuer", values["Jwt__Issuer"]);
        Assert.Equal("http://localhost:4200", values["Cors__AllowedOrigin"]);
        Assert.Equal("quoted value", values["Seed__Password"]);
    }

    [Fact]
    public void A_value_may_contain_equals_signs()
    {
        Assert.Equal("abc==def", Read("Jwt__SigningKey=abc==def")["Jwt__SigningKey"]);
    }

    [Fact]
    public void A_missing_file_gives_no_values()
    {
        Assert.Empty(DotEnvFile.Read(_path));
    }

    [Fact]
    public void A_line_without_a_key_and_value_is_reported_with_its_line_number()
    {
        var failure = Assert.Throws<FormatException>(() => Read("Valid__Key=1\nthis is not valid"));

        Assert.Contains("line 2", failure.Message);
    }
}
