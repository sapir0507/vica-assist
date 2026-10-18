using VicaAssist.Api.Models.Settings;

namespace VicaAssist.Api.Interfaces;

public interface IConfigurationService
{
    AppSettings Settings { get; }
}
