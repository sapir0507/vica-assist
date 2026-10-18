using VicaAssist.Api.Models.Validation;

namespace VicaAssist.Api.Interfaces;

/// <summary>Rules for one request type that its attributes cannot express. An empty result means valid.</summary>
public interface IValidator<in T>
{
    Task<IReadOnlyList<ValidationError>> ValidateAsync(T instance, CancellationToken cancellationToken);
}
