using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Services;

public sealed class UserService(IUserRepository users, PasswordService passwords, TimeProvider timeProvider)
    : IUserService
{
    public async Task<IReadOnlyList<UserResponse>> ListAsync(CancellationToken cancellationToken) =>
        [.. (await users.ListAsync(cancellationToken)).Select(UserResponse.From)];

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var created = await users.TryAddAsync(
            request.Username.Trim(),
            request.Email.Trim(),
            passwords.Hash(request.Password),
            request.Role,
            timeProvider.GetUtcNow(),
            cancellationToken);

        return created is null
            ? throw ApiException.Conflict("That username or email is already in use.")
            : UserResponse.From(created);
    }
}
