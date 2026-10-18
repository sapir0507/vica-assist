using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class AuthTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Registering_creates_a_customer_who_can_sign_in_and_read_their_profile()
    {
        var registered = await _client.RegisterAsync("new-customer", "Sup3rSecret!");
        var session = await _client.LoginAsync("new-customer", "Sup3rSecret!");

        var signedIn = await factory.CreateSignedInClientAsync("new-customer", "Sup3rSecret!");
        var me = await signedIn.GetFromJsonAsync<UserResponse>("/api/v1/auth/me");

        Assert.Equal(Role.Customer, registered.Role);
        Assert.Equal(registered.Id, session.User.Id);
        Assert.Equal(registered, me);
    }

    [Fact]
    public async Task Registering_a_taken_username_is_rejected_whatever_its_case()
    {
        await _client.RegisterAsync("taken-name");

        var response = await _client.PostAsJsonAsync(
            "/api/v1/auth/register", new RegisterRequest("TAKEN-NAME", "other@example.com", "Sup3rSecret!"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Registering_with_invalid_fields_returns_validation_problems()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/v1/auth/register", new RegisterRequest("a", "not-an-email", "short"));

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Username", problem!.Errors.Keys);
        Assert.Contains("Email", problem.Errors.Keys);
        Assert.Contains("Password", problem.Errors.Keys);
    }

    [Theory]
    [InlineData("admin", Role.Admin)]
    [InlineData("livetotell", Role.Agent)]
    [InlineData("sapir0507", Role.Customer)]
    public async Task Seeded_users_sign_in_with_their_role(string username, Role expectedRole)
    {
        var session = await _client.LoginAsync(username, ApiFactory.SeedPassword);

        Assert.Equal(expectedRole, session.User.Role);
    }

    [Fact]
    public async Task Signing_in_by_email_works()
    {
        var session = await _client.LoginAsync("ADMIN@example.com", ApiFactory.SeedPassword);

        Assert.Equal("admin", session.User.Username);
    }

    [Fact]
    public async Task A_wrong_password_and_an_unknown_user_get_the_same_answer()
    {
        var wrongPassword = await _client.TryLoginAsync("admin", "not-the-password");
        var unknownUser = await _client.TryLoginAsync("nobody-here", "not-the-password");

        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknownUser.StatusCode);
        Assert.Equal(
            (await wrongPassword.Content.ReadFromJsonAsync<ProblemDetails>())!.Title,
            (await unknownUser.Content.ReadFromJsonAsync<ProblemDetails>())!.Title);
    }

    [Fact]
    public async Task Refreshing_returns_new_tokens_and_the_old_refresh_token_stops_working()
    {
        var first = await _client.LoginAsync("sapir0507", ApiFactory.SeedPassword);

        var refreshed = await _client.RefreshAsync(first.RefreshToken);
        var secondSession = await refreshed.Content.ReadFromJsonAsync<AuthResponse>();
        var replay = await _client.RefreshAsync(first.RefreshToken);

        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        Assert.NotEqual(first.RefreshToken, secondSession!.RefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
    }

    [Fact]
    public async Task Replaying_a_rotated_refresh_token_also_ends_the_new_session()
    {
        var first = await _client.LoginAsync("sapir0507", ApiFactory.SeedPassword);
        var secondSession = await (await _client.RefreshAsync(first.RefreshToken))
            .Content.ReadFromJsonAsync<AuthResponse>();

        await _client.RefreshAsync(first.RefreshToken);
        var useNewToken = await _client.RefreshAsync(secondSession!.RefreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, useNewToken.StatusCode);
    }

    [Fact]
    public async Task An_unknown_refresh_token_is_rejected()
    {
        var response = await _client.RefreshAsync("not-a-real-token");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logging_out_revokes_the_refresh_token_and_can_be_repeated()
    {
        var session = await _client.LoginAsync("sapir0507", ApiFactory.SeedPassword);

        var firstLogout = await _client.PostAsJsonAsync("/api/v1/auth/logout", new RefreshTokenRequest(session.RefreshToken));
        var secondLogout = await _client.PostAsJsonAsync("/api/v1/auth/logout", new RefreshTokenRequest(session.RefreshToken));
        var refresh = await _client.RefreshAsync(session.RefreshToken);

        Assert.Equal(HttpStatusCode.NoContent, firstLogout.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, secondLogout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    [Fact]
    public async Task Remember_me_gives_the_refresh_token_the_long_lifetime()
    {
        var remembered = await _client.LoginAsync("sapir0507", ApiFactory.SeedPassword, rememberMe: true);
        var sessionOnly = await _client.LoginAsync("sapir0507", ApiFactory.SeedPassword, rememberMe: false);

        Assert.Equal(TimeSpan.FromDays(30), remembered.RefreshTokenExpiresAt - factory.Time.GetUtcNow());
        Assert.Equal(TimeSpan.FromHours(12), sessionOnly.RefreshTokenExpiresAt - factory.Time.GetUtcNow());
    }

    [Fact]
    public async Task A_session_refresh_token_expires_but_a_remembered_one_lasts()
    {
        using var ownFactory = new ApiFactory();
        var client = ownFactory.CreateClient();
        var sessionOnly = await client.LoginAsync("sapir0507", ApiFactory.SeedPassword, rememberMe: false);
        var remembered = await client.LoginAsync("sapir0507", ApiFactory.SeedPassword, rememberMe: true);

        ownFactory.Time.Advance(TimeSpan.FromHours(13));

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.RefreshAsync(sessionOnly.RefreshToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.RefreshAsync(remembered.RefreshToken)).StatusCode);
    }
}
