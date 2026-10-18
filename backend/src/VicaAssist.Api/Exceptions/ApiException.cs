namespace VicaAssist.Api.Exceptions;

/// <summary>A failure the caller can act on; <see cref="ApiExceptionHandler"/> turns it into a ProblemDetails response.</summary>
public sealed class ApiException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;

    public static ApiException Unauthorized(string message) => new(StatusCodes.Status401Unauthorized, message);

    public static ApiException BadRequest(string message) => new(StatusCodes.Status400BadRequest, message);

    public static ApiException Conflict(string message) => new(StatusCodes.Status409Conflict, message);
}
