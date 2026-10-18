using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Settings;

namespace VicaAssist.Api.Services;

/// <summary>
/// Reads the app's settings, later sources overriding earlier ones: <c>appsettings.json</c>, then
/// <c>appsettings.{environment}.json</c>, then <c>.env</c>, then real environment variables.
/// Variables use <c>Section__Key</c> names (<c>Jwt__SigningKey</c>). Invalid settings stop the app at start-up.
/// </summary>
public sealed class ConfigurationService : IConfigurationService
{
    private const string SectionSeparator = "__";

    private static readonly JsonMergeSettings MergeSettings = new()
    {
        MergeArrayHandling = MergeArrayHandling.Replace,
        MergeNullValueHandling = MergeNullValueHandling.Ignore
    };

    public ConfigurationService(
        string contentRootPath, string environmentName, IReadOnlyDictionary<string, string?> environmentVariables)
    {
        var settings = ReadJsonFile(Path.Combine(contentRootPath, "appsettings.json"), required: true)!;
        var environmentSettings = ReadJsonFile(Path.Combine(contentRootPath, $"appsettings.{environmentName}.json"), required: false);
        if (environmentSettings is not null)
        {
            settings.Merge(environmentSettings, MergeSettings);
        }

        Overlay(settings, DotEnvFile.Read(Path.Combine(contentRootPath, ".env")));
        Overlay(settings, environmentVariables);

        Settings = settings.ToObject<AppSettings>() ?? new AppSettings();
        EnsureValid(Settings);
    }

    public AppSettings Settings { get; }

    private static JObject? ReadJsonFile(string path, bool required)
    {
        if (!File.Exists(path))
        {
            return required ? throw new InvalidOperationException($"The settings file {path} was not found.") : null;
        }

        try
        {
            return JObject.Parse(
                File.ReadAllText(path), new JsonLoadSettings { CommentHandling = CommentHandling.Ignore });
        }
        catch (JsonReaderException exception)
        {
            throw new InvalidOperationException($"The settings file {path} is not valid JSON: {exception.Message}", exception);
        }
    }

    /// <summary>Writes <c>A__B</c> style entries into the JSON tree, so they are converted to the property's type with the rest.</summary>
    private static void Overlay(JObject settings, IEnumerable<KeyValuePair<string, string?>> values)
    {
        foreach (var (key, value) in values)
        {
            var path = key.Split(SectionSeparator, StringSplitOptions.RemoveEmptyEntries);
            if (path.Length < 2)
            {
                continue;
            }

            var section = settings;
            foreach (var name in path[..^1])
            {
                var existing = section.Property(name, StringComparison.OrdinalIgnoreCase);
                if (existing?.Value is not JObject child)
                {
                    child = new JObject();
                    section[existing?.Name ?? name] = child;
                }

                section = child;
            }

            var leaf = path[^1];
            section[section.Property(leaf, StringComparison.OrdinalIgnoreCase)?.Name ?? leaf] = value;
        }
    }

    private static void EnsureValid(AppSettings settings)
    {
        var errors = new List<string>();
        foreach (var sectionProperty in typeof(AppSettings).GetProperties())
        {
            var section = sectionProperty.GetValue(settings)!;
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(section, new ValidationContext(section), results, validateAllProperties: true);
            errors.AddRange(results.Select(result =>
                $"{sectionProperty.Name}:{string.Join(",", result.MemberNames)}: {result.ErrorMessage}"));
        }

        if (errors.Count > 0)
        {
            throw new InvalidOperationException(
                "The settings are invalid:" + string.Concat(errors.Select(error => $"{Environment.NewLine}  {error}")));
        }
    }
}
