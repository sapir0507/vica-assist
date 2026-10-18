using VicaAssist.Api.Enums;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Interfaces;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> ListAsync(CancellationToken cancellationToken);

    Task<User?> FindByIdAsync(int id, CancellationToken cancellationToken);

    /// <summary>Finds a user by username or email, ignoring case.</summary>
    Task<User?> FindByLoginAsync(string login, CancellationToken cancellationToken);

    /// <summary>Adds the user, or returns null when the username or email is already taken.</summary>
    Task<User?> TryAddAsync(
        string username, string email, string passwordHash, Role role, DateTimeOffset createdAt,
        CancellationToken cancellationToken);

    Task UpdatePasswordHashAsync(int userId, string passwordHash, CancellationToken cancellationToken);
}
