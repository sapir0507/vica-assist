using System.Net.Http.Headers;
using System.Net.Http.Json;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Tests.Support;

public static class ApiClientExtensions
{
    public static async Task<UserResponse> RegisterAsync(
        this HttpClient client, string? username = null, string password = "Sup3rSecret!")
    {
        username ??= $"user-{Guid.NewGuid():N}";
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register", new RegisterRequest(username, $"{username}@example.com", password));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<UserResponse>())!;
    }

    public static async Task<AuthResponse> LoginAsync(
        this HttpClient client, string login, string password, bool rememberMe = false)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(login, password, rememberMe));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    public static Task<HttpResponseMessage> TryLoginAsync(this HttpClient client, string login, string password) =>
        client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(login, password));

    public static Task<HttpResponseMessage> RefreshAsync(this HttpClient client, string refreshToken) =>
        client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshTokenRequest(refreshToken));

    /// <summary>Returns a client that sends the access token of a signed-in user.</summary>
    public static async Task<HttpClient> CreateSignedInClientAsync(this ApiFactory factory, string login, string password)
    {
        var client = factory.CreateClient();
        var session = await client.LoginAsync(login, password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
        return client;
    }
}
