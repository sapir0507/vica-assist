using System.Text.RegularExpressions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Models.Validation;

namespace VicaAssist.Api.Validators;

/// <summary>Used for both self-registration and an admin creating a user.</summary>
public sealed partial class CreateUserRequestValidator : IValidator<CreateUserRequest>
{
    private const int MinimumUsernameLength = 3;

    // No "@": sign-in accepts a username or an email, so a username shaped like an email address could be
    // mistaken for another account's email there.
    [GeneratedRegex(@"^[\p{L}\p{N} ._-]+$")]
    private static partial Regex AllowedUsernameCharacters();

    public Task<IReadOnlyList<ValidationError>> ValidateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var errors = new List<ValidationError>();

        // The service stores the trimmed value, so that is what the rules apply to.
        var username = request.Username.Trim();
        if (username.Length < MinimumUsernameLength)
        {
            errors.Add(new("Username", $"The username must have at least {MinimumUsernameLength} characters, not counting spaces around it."));
        }
        else if (!AllowedUsernameCharacters().IsMatch(username))
        {
            errors.Add(new("Username", "The username may only contain letters, digits, spaces, '.', '_' and '-'."));
        }

        var emailName = request.Email.Trim().Split('@')[0];
        errors.AddRange(PasswordRules.Problems(request.Password, username, emailName)
            .Select(problem => new ValidationError("Password", problem)));

        return Task.FromResult<IReadOnlyList<ValidationError>>(errors);
    }
}
