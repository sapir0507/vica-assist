namespace VicaAssist.Api.Services;

public static class DotEnvFile
{
    /// <summary>
    /// Reads the <c>KEY=VALUE</c> lines of a <c>.env</c> file. Blank lines and <c>#</c> comments are skipped and
    /// matching quotes around a value are removed. A missing file gives an empty result.
    /// </summary>
    public static IReadOnlyDictionary<string, string?> Read(string path)
    {
        var values = new Dictionary<string, string?>();
        if (!File.Exists(path))
        {
            return values;
        }

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

            values[line[..separator].Trim()] = Unquote(line[(separator + 1)..].Trim());
        }

        return values;
    }

    private static string Unquote(string value) =>
        value.Length >= 2 && (value[0] == '"' || value[0] == '\'') && value[^1] == value[0]
            ? value[1..^1]
            : value;
}
