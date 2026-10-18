using System.Text.Json.Serialization;

namespace VicaAssist.Api.Enums;

// The explicit names keep the JSON lowercase, as the Angular app expects, wherever the enum is serialised.
[JsonConverter(typeof(JsonStringEnumConverter<Role>))]
public enum Role
{
    [JsonStringEnumMemberName("customer")] Customer,
    [JsonStringEnumMemberName("agent")] Agent,
    [JsonStringEnumMemberName("admin")] Admin
}
