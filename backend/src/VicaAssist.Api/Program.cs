using Serilog;
using VicaAssist.Api.Extensions;
using VicaAssist.Api.Interfaces;

// Console-only logger for the moments before the configured one exists, so a broken Serilog section or a start-up
// failure is still reported. The host replaces it once the settings have been read.
Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // preserveStaticLogger keeps each host on its own logger instead of the process-wide Log.Logger, so several
    // hosts in one process (the integration tests) cannot write into each other's files.
    builder.Host.UseSerilog(
        (context, services, logger) => logger
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services),
        preserveStaticLogger: true);

    builder.Services
        .AddConfigurationService()
        .AddApiServices()
        .AddJwtAuthentication()
        .AddFrontendCors()
        .AddAuthRateLimiting();
    builder.Services.AddControllers().AddNewtonsoftJson();
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
        options.AddSchemaTransformer<EnumSchemaTransformer>();
    });

    var app = builder.Build();

    // Read and validate the settings now, so a missing or invalid value stops start-up instead of the first request.
    app.Services.GetRequiredService<IConfigurationService>();

    // From here on a start-up failure is reported to the configured sinks (the file too), not just the console.
    var logger = app.Services.GetRequiredService<Serilog.ILogger>();
    Log.Logger = logger;
    app.UseSerilogRequestLogging(options => options.Logger = logger);
    app.UseExceptionHandler();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi().AllowAnonymous();
        app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Vica Assist API v1"));
    }
    else
    {
        app.UseHsts();
    }

    app.UseHttpsRedirection();
    app.UseCors();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
// HostAbortedException is how WebApplicationFactory (and design-time tools) stop the entry point on purpose.
catch (Exception exception) when (exception is not HostAbortedException)
{
    Log.Fatal(exception, "The API stopped during start-up");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

// Makes the entry point visible to WebApplicationFactory in the test project.
public partial class Program;
