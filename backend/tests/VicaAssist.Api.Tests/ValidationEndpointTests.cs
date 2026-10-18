using System.Net;
using Microsoft.AspNetCore.Mvc;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Models.Auth;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

/// <summary>The rules that the request attributes cannot express, seen from the outside.</summary>
public sealed class ValidationEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private Task<HttpResponseMessage> Register(string username, string password, string? email = null) =>
        _client.PostJsonAsync("/api/v1/auth/register", new RegisterRequest(username, email ?? $"{Guid.NewGuid():N}@example.com", password));

    private static async Task<IDictionary<string, string[]>> ErrorsOf(HttpResponseMessage response) =>
        (await response.Content.ReadAsync<ValidationProblemDetails>()).Errors;

    [Fact]
    public async Task A_username_shaped_like_an_email_address_is_refused_and_no_account_is_created()
    {
        var response = await Register("admin@example.com", "Sup3rSecret!");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Username", (await ErrorsOf(response)).Keys);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.TryLoginAsync("admin@example.com", "Sup3rSecret!")).StatusCode);
    }

    [Fact]
    public async Task A_password_without_a_digit_is_refused()
    {
        var response = await Register($"plain-{Guid.NewGuid():N}", "OnlyLetters");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("digit", Assert.Single((await ErrorsOf(response))["Password"]));
    }

    [Fact]
    public async Task A_password_containing_the_username_is_refused()
    {
        var response = await Register("grace-hopper", "grace-HOPPER-1906");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("must not contain", Assert.Single((await ErrorsOf(response))["Password"]));
    }

    [Fact]
    public async Task Every_broken_rule_is_reported_in_one_response()
    {
        var response = await Register("a@b", "password");

        var errors = await ErrorsOf(response);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Username", errors.Keys);
        Assert.Contains("Password", errors.Keys);
    }

    [Fact]
    public async Task Rule_failures_have_the_same_shape_as_attribute_failures()
    {
        var byAttribute = await Register("ab", "Sup3rSecret!");
        var byRule = await Register("bad!name", "Sup3rSecret!");

        foreach (var response in new[] { byAttribute, byRule })
        {
            var problem = await response.Content.ReadAsync<ValidationProblemDetails>();
            Assert.Equal(400, problem.Status);
            Assert.Contains("Username", problem.Errors.Keys);
        }
    }

    [Fact]
    public async Task An_admin_creating_a_user_is_held_to_the_same_rules()
    {
        var admin = await factory.CreateSignedInClientAsync("admin", ApiFactory.SeedPassword);

        var response = await admin.PostJsonAsync(
            "/api/v1/users", new CreateUserRequest("new@agent", "new.agent@example.com", "lettersonly", Role.Agent));

        var errors = await ErrorsOf(response);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Username", errors.Keys);
        Assert.Contains("Password", errors.Keys);
    }

    [Fact]
    public async Task A_taken_username_is_still_a_conflict_not_a_validation_error()
    {
        await _client.RegisterAsync("already-here");

        var response = await Register("already-here", "Sup3rSecret!");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task A_weak_new_password_is_refused_without_using_up_the_reset_token()
    {
        var user = await _client.RegisterAsync();
        await _client.PostJsonAsync("/api/v1/auth/forgot-password", new ForgotPasswordRequest(user.Username));
        var token = factory.ResetNotifier.LastTokenFor(user.Username);

        var weak = await _client.PostJsonAsync("/api/v1/auth/reset-password", new ResetPasswordRequest(token, "lettersonly"));
        var strong = await _client.PostJsonAsync("/api/v1/auth/reset-password", new ResetPasswordRequest(token, "N3w-Passw0rd"));

        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);
        Assert.Contains("NewPassword", (await ErrorsOf(weak)).Keys);
        Assert.Equal(HttpStatusCode.NoContent, strong.StatusCode);
    }
}
