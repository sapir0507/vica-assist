using VicaAssist.Api.Interfaces;

namespace VicaAssist.Api.Services;

/// <summary>Finds the validator registered for a request type, so a new rule set is one class and one registration.</summary>
public sealed class ValidatorFactory(IServiceProvider services) : IValidatorFactory
{
    public IValidator<T> Create<T>() => services.GetRequiredService<IValidator<T>>();
}
