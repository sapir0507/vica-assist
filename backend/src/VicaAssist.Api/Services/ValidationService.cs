using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;

namespace VicaAssist.Api.Services;

public sealed class ValidationService(IValidatorFactory validators) : IValidationService
{
    public async Task ValidateAsync<T>(T instance, CancellationToken cancellationToken)
    {
        var errors = await validators.Create<T>().ValidateAsync(instance, cancellationToken);
        if (errors.Count > 0)
        {
            throw new ValidationFailedException(errors);
        }
    }
}
