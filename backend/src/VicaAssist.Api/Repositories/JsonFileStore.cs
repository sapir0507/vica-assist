using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Data;

namespace VicaAssist.Api.Repositories;

/// <summary>
/// Keeps the database in memory and writes it to one JSON file after every change.
/// One lock serialises all access, so a read-then-write inside <see cref="WriteAsync{T}"/> is atomic.
/// </summary>
public sealed class JsonFileStore(IConfigurationService configuration, IHostEnvironment environment)
{
    private static readonly JsonSerializerSettings JsonSettings = new()
    {
        ContractResolver = new CamelCasePropertyNamesContractResolver(),
        Formatting = Formatting.Indented
    };

    private readonly string _path = Path.GetFullPath(configuration.Settings.Data.FilePath, environment.ContentRootPath);
    private readonly SemaphoreSlim _lock = new(1, 1);
    private JsonDatabase? _database;

    public async Task<T> ReadAsync<T>(Func<JsonDatabase, T> read, CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            return read(await LoadAsync(cancellationToken));
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<T> WriteAsync<T>(Func<JsonDatabase, T> change, CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var database = await LoadAsync(cancellationToken);
            var result = change(database);
            await SaveAsync(database, cancellationToken);
            return result;
        }
        catch
        {
            // The in-memory copy may now differ from the file; reload from disk on the next call.
            _database = null;
            throw;
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<JsonDatabase> LoadAsync(CancellationToken cancellationToken)
    {
        if (_database is not null)
        {
            return _database;
        }

        if (!File.Exists(_path))
        {
            return _database = new JsonDatabase();
        }

        var json = await File.ReadAllTextAsync(_path, cancellationToken);
        _database = JsonConvert.DeserializeObject<JsonDatabase>(json, JsonSettings) ?? new JsonDatabase();
        return _database;
    }

    private async Task SaveAsync(JsonDatabase database, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_path)!);

        // Write beside the target and move it into place, so a crash mid-write cannot leave a half-written database.
        var temporaryPath = _path + ".tmp";
        await File.WriteAllTextAsync(temporaryPath, JsonConvert.SerializeObject(database, JsonSettings), cancellationToken);

        File.Move(temporaryPath, _path, overwrite: true);
    }
}
