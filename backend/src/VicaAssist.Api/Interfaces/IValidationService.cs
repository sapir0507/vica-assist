using VicaAssist.Api.Exceptions;

namespace VicaAssist.Api.Interfaces;

public interface IValidationService
{
    /// <exception cref="ValidationFailedException">The request breaks one or more rules.</exception>
    Task ValidateAsync<T>(T instance, CancellationToken cancellationToken);
}
