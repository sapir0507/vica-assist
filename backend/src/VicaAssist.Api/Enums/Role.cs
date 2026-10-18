using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace VicaAssist.Api.Enums;

// The explicit names keep the JSON lowercase, as the Angular app expects, wherever the enum is serialised.
[JsonConverter(typeof(StringEnumConverter))]
public enum Role
{
    [EnumMember(Value = "customer")] Customer,
    [EnumMember(Value = "agent")] Agent,
    [EnumMember(Value = "admin")] Admin
}
