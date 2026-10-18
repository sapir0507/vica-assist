using VicaAssist.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddDotEnvFile(Path.Combine(builder.Environment.ContentRootPath, ".env"));

builder.Services
    .AddApiOptions(builder.Configuration)
    .AddApiServices()
    .AddJwtAuthentication()
    .AddFrontendCors()
    .AddAuthRateLimiting();
builder.Services.AddControllers();
builder.Services.AddOpenApi(options => options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

var app = builder.Build();

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
