using VicaAssist.Api.Extensions;
using VicaAssist.Api.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddConfigurationService()
    .AddApiServices()
    .AddJwtAuthentication()
    .AddFrontendCors()
    .AddAuthRateLimiting();
builder.Services.AddControllers();
builder.Services.AddOpenApi(options => options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

var app = builder.Build();

// Read and validate the settings now, so a missing or invalid value stops start-up instead of the first request.
app.Services.GetRequiredService<IConfigurationService>();

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

// Makes the entry point visible to WebApplicationFactory in the test project.
public partial class Program;
