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
using VicaAssist.Api.Models.Data;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Repositories;
using VicaAssist.Api.Services;

namespace VicaAssist.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>Binds every options class to its configuration section and fails startup if one is invalid.</summary>
    public static IServiceCollection AddApiOptions(this IServiceCollection services, IConfiguration configuration)
    {
        AddValidatedOptions<JwtOptions>(JwtOptions.SectionName);
        AddValidatedOptions<AllowedOriginOptions>(AllowedOriginOptions.SectionName);
        AddValidatedOptions<DataOptions>(DataOptions.SectionName);
        AddValidatedOptions<SeedOptions>(SeedOptions.SectionName);
        AddValidatedOptions<PasswordResetOptions>(PasswordResetOptions.SectionName);
        AddValidatedOptions<RateLimitOptions>(RateLimitOptions.SectionName);
        return services;

        void AddValidatedOptions<T>(string sectionName) where T : class =>
            services.AddOptions<T>()
                .Bind(configuration.GetSection(sectionName))
                .ValidateDataAnnotations()
                .ValidateOnStart();
    }

    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<JsonFileStore>();
        services.AddSingleton<IUserRepository, JsonUserRepository>();
        services.AddSingleton<IRefreshTokenRepository, JsonRefreshTokenRepository>();
        services.AddSingleton<IPasswordResetTokenRepository, JsonPasswordResetTokenRepository>();

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
        services.AddOptions<CorsOptions>().Configure<IOptions<AllowedOriginOptions>>((cors, allowedOrigin) =>
            cors.AddDefaultPolicy(policy => policy
                .WithOrigins(allowedOrigin.Value.AllowedOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod()));
        return services;
    }

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter();
        services.AddOptions<RateLimiterOptions>().Configure<IOptions<RateLimitOptions>>((limiter, rateLimit) =>
        {
            limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            limiter.AddPolicy(RateLimitPolicies.Auth, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = rateLimit.Value.AuthRequestsPerMinute,
                        Window = TimeSpan.FromMinutes(1)
                    }));
        });
        return services;
    }
}
