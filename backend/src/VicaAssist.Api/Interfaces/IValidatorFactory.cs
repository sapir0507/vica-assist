namespace VicaAssist.Api.Interfaces;

public interface IValidatorFactory
{
    /// <exception cref="InvalidOperationException">No validator is registered for <typeparamref name="T"/>.</exception>
    IValidator<T> Create<T>();
}
