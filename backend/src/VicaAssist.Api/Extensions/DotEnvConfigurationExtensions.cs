namespace VicaAssist.Api.Extensions;

public static class DotEnvConfigurationExtensions
{
    /// <summary>
    /// Adds the <c>KEY=VALUE</c> lines of a <c>.env</c> file as configuration. <c>__</c> in a key becomes the
    /// configuration section separator, matching environment variable names (<c>Jwt__SigningKey</c>).
    /// A variable already set in the real environment wins over the file. A missing file is fine.
    /// </summary>
    public static IConfigurationBuilder AddDotEnvFile(this IConfigurationBuilder builder, string path)
    {
        if (!File.Exists(path))
        {
            return builder;
        }

        var values = new Dictionary<string, string?>();
        var lineNumber = 0;
        foreach (var rawLine in File.ReadLines(path))
        {
            lineNumber++;
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#'))
            {
                continue;
            }

            var separator = line.IndexOf('=');
            if (separator <= 0)
            {
                throw new FormatException($"{path} line {lineNumber}: expected KEY=VALUE.");
            }

            var key = line[..separator].Trim();
            var value = Unquote(line[(separator + 1)..].Trim());
            if (Environment.GetEnvironmentVariable(key) is null)
            {
                values[key.Replace("__", ConfigurationPath.KeyDelimiter)] = value;
            }
        }

        return builder.AddInMemoryCollection(values);
    }

    private static string Unquote(string value) =>
        value.Length >= 2 && (value[0] == '"' || value[0] == '\'') && value[^1] == value[0]
            ? value[1..^1]
            : value;
}
