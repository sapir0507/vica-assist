namespace VicaAssist.Api.Validators;

/// <summary>Password rules beyond the length limits that the request attributes already enforce.</summary>
public static class PasswordRules
{
    // A shorter piece (a two-letter username) would reject too many unrelated passwords.
    private const int MinimumIdentityPartLength = 3;

    /// <param name="identityParts">Values the password must not contain, such as the username and the part of the email before the @.</param>
    public static IEnumerable<string> Problems(string password, params string?[] identityParts)
    {
        if (!password.Any(char.IsLetter))
        {
            yield return "The password must contain a letter.";
        }

        if (!password.Any(char.IsDigit))
        {
            yield return "The password must contain a digit.";
        }

        if (identityParts.Any(part => part is { Length: >= MinimumIdentityPartLength }
                && password.Contains(part, StringComparison.OrdinalIgnoreCase)))
        {
            yield return "The password must not contain your username or email name.";
        }
    }
}
