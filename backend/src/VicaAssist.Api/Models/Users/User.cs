using VicaAssist.Api.Enums;

namespace VicaAssist.Api.Models.Users;

public sealed record User(
    int Id,
    string Username,
    string Email,
    string PasswordHash,
    Role Role,
    bool Active,
    DateTimeOffset CreatedAt);
