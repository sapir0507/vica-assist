using VicaAssist.Api.Enums;

namespace VicaAssist.Api.Models.Users;

public sealed record UserResponse(int Id, string Username, string Email, Role Role, bool Active)
{
    public static UserResponse From(User user) =>
        new(user.Id, user.Username, user.Email, user.Role, user.Active);
}
