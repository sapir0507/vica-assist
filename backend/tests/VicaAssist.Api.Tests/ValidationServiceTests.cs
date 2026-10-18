using Microsoft.Extensions.DependencyInjection;
using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Validation;
using VicaAssist.Api.Services;

namespace VicaAssist.Api.Tests;

public sealed class ValidationServiceTests
{
    private sealed record Sample(string Name);

    private sealed class SampleValidator : IValidator<Sample>
    {
        public Task<IReadOnlyList<ValidationError>> ValidateAsync(Sample instance, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ValidationError>>(
                instance.Name == "ok" ? [] : [new ValidationError("Name", "Wrong."), new ValidationError("Name", "Also wrong.")]);
    }

    private static ServiceProvider BuildProvider() =>
        new ServiceCollection()
            .AddSingleton<IValidatorFactory, ValidatorFactory>()
            .AddSingleton<IValidationService, ValidationService>()
            .AddSingleton<IValidator<Sample>, SampleValidator>()
            .BuildServiceProvider();

    [Fact]
    public void The_factory_returns_the_validator_registered_for_the_type()
    {
        using var provider = BuildProvider();

        var validator = provider.GetRequiredService<IValidatorFactory>().Create<Sample>();

        Assert.IsType<SampleValidator>(validator);
    }

    [Fact]
    public void Asking_for_a_type_without_a_validator_fails_loudly()
    {
        using var provider = BuildProvider();

        Assert.Throws<InvalidOperationException>(() => provider.GetRequiredService<IValidatorFactory>().Create<string>());
    }

    [Fact]
    public async Task A_valid_instance_passes()
    {
        using var provider = BuildProvider();

        await provider.GetRequiredService<IValidationService>().ValidateAsync(new Sample("ok"), CancellationToken.None);
    }

    [Fact]
    public async Task An_invalid_instance_throws_with_all_of_the_errors()
    {
        using var provider = BuildProvider();

        var failure = await Assert.ThrowsAsync<ValidationFailedException>(() =>
            provider.GetRequiredService<IValidationService>().ValidateAsync(new Sample("bad"), CancellationToken.None));

        Assert.Equal(["Wrong.", "Also wrong."], failure.Errors.Select(error => error.Message));
    }
}
