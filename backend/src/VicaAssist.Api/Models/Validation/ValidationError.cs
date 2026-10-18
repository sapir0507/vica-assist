namespace VicaAssist.Api.Models.Validation;

/// <param name="Field">The request property the message is about, spelled like the one the attribute errors use.</param>
public sealed record ValidationError(string Field, string Message);
