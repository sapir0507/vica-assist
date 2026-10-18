using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Tests.Support;

public static class ApiClientExtensions
{
    // Same JSON stack as the server, so enums travel as "agent" rather than a number.
    private static readonly JsonSerializerSettings JsonSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };

    public static Task<HttpResponseMessage> PostJsonAsync<T>(this HttpClient client, string url, T body) =>
        client.PostAsync(url, new StringContent(JsonConvert.SerializeObject(body, JsonSettings), Encoding.UTF8, "application/json"));

    public static async Task<T> GetJsonAsync<T>(this HttpClient client, string url) =>
        await (await client.GetAsync(url)).Content.ReadAsync<T>();

    public static async Task<T> ReadAsync<T>(this HttpContent content) =>
        JsonConvert.DeserializeObject<T>(await content.ReadAsStringAsync(), JsonSettings)!;

    public static async Task<UserResponse> RegisterAsync(
        this HttpClient client, string? username = null, string password = "Sup3rSecret!")
    {
        username ??= $"user-{Guid.NewGuid():N}";
        var response = await client.PostJsonAsync(
            "/api/v1/auth/register", new RegisterRequest(username, $"{username}@example.com", password));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadAsync<UserResponse>())!;
    }

    public static async Task<AuthResponse> LoginAsync(
        this HttpClient client, string login, string password, bool rememberMe = false)
    {
        var response = await client.PostJsonAsync("/api/v1/auth/login", new LoginRequest(login, password, rememberMe));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadAsync<AuthResponse>())!;
    }

    public static Task<HttpResponseMessage> TryLoginAsync(this HttpClient client, string login, string password) =>
        client.PostJsonAsync("/api/v1/auth/login", new LoginRequest(login, password));

    public static Task<HttpResponseMessage> RefreshAsync(this HttpClient client, string refreshToken) =>
        client.PostJsonAsync("/api/v1/auth/refresh", new RefreshTokenRequest(refreshToken));

    /// <summary>Returns a client that sends the access token of a signed-in user.</summary>
    public static async Task<HttpClient> CreateSignedInClientAsync(this ApiFactory factory, string login, string password)
    {
        var client = factory.CreateClient();
        var session = await client.LoginAsync(login, password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
        return client;
    }
}
