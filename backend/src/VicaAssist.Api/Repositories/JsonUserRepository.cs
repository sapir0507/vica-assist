using VicaAssist.Api.Enums;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Repositories;

public sealed class JsonUserRepository(JsonFileStore store) : IUserRepository
{
    public Task<IReadOnlyList<User>> ListAsync(CancellationToken cancellationToken) =>
        store.ReadAsync<IReadOnlyList<User>>(database => [.. database.Users], cancellationToken);

    public Task<User?> FindByIdAsync(int id, CancellationToken cancellationToken) =>
        store.ReadAsync(database => database.Users.FirstOrDefault(user => user.Id == id), cancellationToken);

    public Task<User?> FindByLoginAsync(string login, CancellationToken cancellationToken) =>
        store.ReadAsync(
            database => database.Users.FirstOrDefault(user => MatchesLogin(user, login)),
            cancellationToken);

    public Task<User?> TryAddAsync(
        string username, string email, string passwordHash, Role role, DateTimeOffset createdAt,
        CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                if (database.Users.Any(user => IsSame(user.Username, username) || IsSame(user.Email, email)))
                {
                    return null;
                }

                var nextId = database.Users.Count == 0 ? 1 : database.Users.Max(user => user.Id) + 1;
                var created = new User(nextId, username, email, passwordHash, role, Active: true, createdAt);
                database.Users.Add(created);
                return created;
            },
            cancellationToken);

    public Task UpdatePasswordHashAsync(int userId, string passwordHash, CancellationToken cancellationToken) =>
        store.WriteAsync(
            database =>
            {
                var index = database.Users.FindIndex(user => user.Id == userId);
                if (index >= 0)
                {
                    database.Users[index] = database.Users[index] with { PasswordHash = passwordHash };
                }

                return 0;
            },
            cancellationToken);

    private static bool MatchesLogin(User user, string login) =>
        IsSame(user.Username, login) || IsSame(user.Email, login);

    private static bool IsSame(string left, string right) =>
        string.Equals(left, right, StringComparison.OrdinalIgnoreCase);
}
