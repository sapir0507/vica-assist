using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace VicaAssist.Api.Exceptions;

public sealed class ApiExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problem = exception switch
        {
            ApiException apiException => new ProblemDetails { Status = apiException.StatusCode, Title = apiException.Message },
            // Same shape as the 400 MVC sends for attribute failures, so clients read both the same way.
            ValidationFailedException validation => new ValidationProblemDetails(
                validation.Errors
                    .GroupBy(error => error.Field)
                    .ToDictionary(group => group.Key, group => group.Select(error => error.Message).ToArray()))
            {
                Status = StatusCodes.Status400BadRequest,
                Title = validation.Message
            },
            _ => null
        };

        if (problem is null)
        {
            return false;
        }

        httpContext.Response.StatusCode = problem.Status!.Value;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = problem
        });
    }
}
