using System.Reflection;
using System.Runtime.Serialization;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace VicaAssist.Api.Extensions;

/// <summary>
/// The OpenAPI generator describes enums the System.Text.Json way (numbers), but the API serialises them with
/// Newtonsoft as their <c>[EnumMember]</c> names. This makes the document say what is actually sent.
/// </summary>
public sealed class EnumSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(
        OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
    {
        var type = Nullable.GetUnderlyingType(context.JsonTypeInfo.Type) ?? context.JsonTypeInfo.Type;
        if (type.IsEnum)
        {
            schema.Type = JsonSchemaType.String;
            schema.Format = null;
            schema.Enum = [.. type
                .GetFields(BindingFlags.Public | BindingFlags.Static)
                .Select(field => (JsonNode)JsonValue.Create(field.GetCustomAttribute<EnumMemberAttribute>()?.Value ?? field.Name)!)];
        }

        return Task.CompletedTask;
    }
}
