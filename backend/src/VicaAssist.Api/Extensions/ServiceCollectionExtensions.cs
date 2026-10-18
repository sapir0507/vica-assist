using System.Collections;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using VicaAssist.Api.Authorization;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Exceptions;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Repositories;
using VicaAssist.Api.Services;
using VicaAssist.Api.Validators;

namespace VicaAssist.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the settings reader. It is created when first needed, from the host's content root and environment
    /// name, so hosts that override either (such as the test host) are respected.
    /// </summary>
    public static IServiceCollection AddConfigurationService(this IServiceCollection services)
    {
        services.AddSingleton<IConfigurationService>(provider =>
        {
            var environment = provider.GetRequiredService<IHostEnvironment>();
            var environmentVariables = Environment.GetEnvironmentVariables()
                .Cast<DictionaryEntry>()
                .ToDictionary(entry => (string)entry.Key, entry => (string?)entry.Value);
            return new ConfigurationService(environment.ContentRootPath, environment.EnvironmentName, environmentVariables);
        });
        return services;
    }

    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<JsonFileStore>();
        services.AddSingleton<IUserRepository, JsonUserRepository>();
        services.AddSingleton<IRefreshTokenRepository, JsonRefreshTokenRepository>();
        services.AddSingleton<IPasswordResetTokenRepository, JsonPasswordResetTokenRepository>();

        services.AddSingleton<IValidatorFactory, ValidatorFactory>();
        services.AddSingleton<IValidationService, ValidationService>();
        services.AddSingleton<IValidator<CreateUserRequest>, CreateUserRequestValidator>();
        services.AddSingleton<IValidator<ResetPasswordRequest>, ResetPasswordRequestValidator>();

        services.AddSingleton<PasswordService>();
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IUserService, UserService>();
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<IPasswordResetService, PasswordResetService>();
        services.AddSingleton<IPasswordResetNotifier, LoggingPasswordResetNotifier>();
        services.AddHostedService<DatabaseSeeder>();

        services.AddExceptionHandler<ApiExceptionHandler>();
        services.AddProblemDetails();
        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddSingleton<IConfigureOptions<JwtBearerOptions>, ConfigureJwtBearerOptions>();

        services.AddAuthorizationBuilder()
            // Endpoints are closed unless they opt out with [AllowAnonymous].
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
            .AddPolicy(Policies.AdminOnly, policy => policy.RequireRole(Role.Admin.ToClaimValue()));
        return services;
    }

    public static IServiceCollection AddFrontendCors(this IServiceCollection services)
    {
        services.AddCors();
        services.AddOptions<CorsOptions>().Configure<IConfigurationService>((cors, configuration) =>
            cors.AddDefaultPolicy(policy => policy
                .WithOrigins(configuration.Settings.Cors.AllowedOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod()));
        return services;
    }

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter();
        services.AddOptions<RateLimiterOptions>().Configure<IConfigurationService>((limiter, configuration) =>
        {
            limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            limiter.AddPolicy(RateLimitPolicies.Auth, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = configuration.Settings.RateLimit.AuthRequestsPerMinute,
                        Window = TimeSpan.FromMinutes(1)
                    }));
        });
        return services;
    }
}
