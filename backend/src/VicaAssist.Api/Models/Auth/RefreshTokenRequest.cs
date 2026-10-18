using System.ComponentModel.DataAnnotations;

namespace VicaAssist.Api.Models.Auth;

public sealed record RefreshTokenRequest([Required] string RefreshToken);
