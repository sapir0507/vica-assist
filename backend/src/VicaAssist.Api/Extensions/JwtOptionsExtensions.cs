using System.Text;
using Microsoft.IdentityModel.Tokens;
using VicaAssist.Api.Models.Auth;

namespace VicaAssist.Api.Extensions;

public static class JwtOptionsExtensions
{
    public static SymmetricSecurityKey CreateSigningKey(this JwtOptions jwt) => new(Encoding.UTF8.GetBytes(jwt.SigningKey));
}
