using VicaAssist.Api.Models.Validation;

namespace VicaAssist.Api.Exceptions;

/// <summary>A request broke validation rules; <see cref="ApiExceptionHandler"/> answers 400 with the errors by field.</summary>
public sealed class ValidationFailedException(IReadOnlyList<ValidationError> errors)
    : Exception("One or more validation errors occurred.")
{
    public IReadOnlyList<ValidationError> Errors { get; } = errors;
}
