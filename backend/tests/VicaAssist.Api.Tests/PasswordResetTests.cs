using System.Net;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class PasswordResetTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string OldPassword = "Old-Passw0rd!";
    private const string NewPassword = "New-Passw0rd!";

    private readonly HttpClient _client = factory.CreateClient();

    private Task<HttpResponseMessage> Forgot(string login) =>
        _client.PostJsonAsync("/api/v1/auth/forgot-password", new ForgotPasswordRequest(login));

    private Task<HttpResponseMessage> Reset(string token, string newPassword = NewPassword) =>
        _client.PostJsonAsync("/api/v1/auth/reset-password", new ResetPasswordRequest(token, newPassword));

    [Fact]
    public async Task Resetting_changes_the_password_and_signs_every_device_out()
    {
        var user = await _client.RegisterAsync(password: OldPassword);
        var session = await _client.LoginAsync(user.Username, OldPassword);

        await Forgot(user.Username);
        var reset = await Reset(factory.ResetNotifier.LastTokenFor(user.Username));

        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.TryLoginAsync(user.Username, OldPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _client.TryLoginAsync(user.Username, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _client.RefreshAsync(session.RefreshToken)).StatusCode);
    }

    [Fact]
    public async Task Asking_for_an_email_that_does_not_exist_answers_the_same_and_sends_nothing()
    {
        var sentBefore = factory.ResetNotifier.SentCount;

        var response = await Forgot("nobody@example.com");

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Equal(sentBefore, factory.ResetNotifier.SentCount);
    }

    [Fact]
    public async Task A_reset_token_works_only_once()
    {
        var user = await _client.RegisterAsync(password: OldPassword);
        await Forgot(user.Username);
        var token = factory.ResetNotifier.LastTokenFor(user.Username);

        var first = await Reset(token);
        var second = await Reset(token, "Another-Passw0rd!");

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    [Fact]
    public async Task Asking_again_invalidates_the_earlier_token()
    {
        var user = await _client.RegisterAsync(password: OldPassword);
        await Forgot(user.Username);
        var earlierToken = factory.ResetNotifier.LastTokenFor(user.Username);
        await Forgot(user.Username);
        var latestToken = factory.ResetNotifier.LastTokenFor(user.Username);

        Assert.Equal(HttpStatusCode.BadRequest, (await Reset(earlierToken)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Reset(latestToken)).StatusCode);
    }

    [Fact]
    public async Task A_token_that_was_never_issued_is_rejected()
    {
        var response = await Reset("made-up-token");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task A_new_password_that_is_too_short_is_rejected_and_keeps_the_token_usable()
    {
        var user = await _client.RegisterAsync(password: OldPassword);
        await Forgot(user.Username);
        var token = factory.ResetNotifier.LastTokenFor(user.Username);

        var tooShort = await Reset(token, "short");
        var valid = await Reset(token);

        Assert.Equal(HttpStatusCode.BadRequest, tooShort.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, valid.StatusCode);
    }

    [Fact]
    public async Task A_token_stops_working_after_it_expires()
    {
        using var ownFactory = new ApiFactory();
        var client = ownFactory.CreateClient();
        var user = await client.RegisterAsync(password: OldPassword);
        await client.PostJsonAsync("/api/v1/auth/forgot-password", new ForgotPasswordRequest(user.Username));
        var token = ownFactory.ResetNotifier.LastTokenFor(user.Username);

        ownFactory.Time.Advance(TimeSpan.FromMinutes(61));
        var response = await client.PostJsonAsync(
            "/api/v1/auth/reset-password", new ResetPasswordRequest(token, NewPassword));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
