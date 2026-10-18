namespace VicaAssist.Api.Enums;

public static class RoleExtensions
{
    /// <summary>The role as it appears in the JWT <c>role</c> claim, matching the lowercase names the Angular app uses.</summary>
    public static string ToClaimValue(this Role role) => role.ToString().ToLowerInvariant();
}
