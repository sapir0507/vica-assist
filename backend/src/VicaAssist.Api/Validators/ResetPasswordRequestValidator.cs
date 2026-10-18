using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Validation;

namespace VicaAssist.Api.Validators;

public sealed class ResetPasswordRequestValidator : IValidator<ResetPasswordRequest>
{
    // The account is only known once the token is redeemed, so the identity check of CreateUserRequestValidator
    // is not possible here; the generic password rules still apply.
    public Task<IReadOnlyList<ValidationError>> ValidateAsync(ResetPasswordRequest request, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<ValidationError>>(
            [.. PasswordRules.Problems(request.NewPassword).Select(problem => new ValidationError("NewPassword", problem))]);
}
