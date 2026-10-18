using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Models.Data;

/// <summary>The whole contents of the JSON database file.</summary>
public sealed class JsonDatabase
{
    public List<User> Users { get; set; } = [];

    public List<RefreshToken> RefreshTokens { get; set; } = [];

    public List<PasswordResetToken> PasswordResetTokens { get; set; } = [];
}
