using System.Net;
using VicaAssist.Api.Enums;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class UsersTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Anonymous_callers_are_turned_away()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("sapir0507")]
    [InlineData("livetotell")]
    public async Task Customers_and_agents_cannot_use_the_admin_endpoints(string username)
    {
        var client = await factory.CreateSignedInClientAsync(username, ApiFactory.SeedPassword);

        var list = await client.GetAsync("/api/v1/users");
        var create = await client.PostJsonAsync(
            "/api/v1/users", new CreateUserRequest("sneaky-admin", "sneaky@example.com", "Sup3rSecret!", Role.Admin));

        Assert.Equal(HttpStatusCode.Forbidden, list.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, create.StatusCode);
    }

    [Fact]
    public async Task An_admin_lists_users_without_any_password_data()
    {
        var client = await factory.CreateSignedInClientAsync("admin", ApiFactory.SeedPassword);

        var response = await client.GetAsync("/api/v1/users");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"username\":\"admin\"", body);
        Assert.DoesNotContain("assword", body);
    }

    [Fact]
    public async Task An_admin_creates_an_agent_who_can_then_sign_in()
    {
        var admin = await factory.CreateSignedInClientAsync("admin", ApiFactory.SeedPassword);

        var response = await admin.PostJsonAsync(
            "/api/v1/users", new CreateUserRequest("agent.new", "agent.new@example.com", "Initial-Passw0rd!", Role.Agent));
        var session = await factory.CreateClient().LoginAsync("agent.new", "Initial-Passw0rd!");

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(Role.Agent, session.User.Role);
    }

    [Fact]
    public async Task Creating_a_user_with_a_taken_username_is_rejected()
    {
        var admin = await factory.CreateSignedInClientAsync("admin", ApiFactory.SeedPassword);

        var response = await admin.PostJsonAsync(
            "/api/v1/users", new CreateUserRequest("livetotell", "different@example.com", "Sup3rSecret!", Role.Agent));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Theory]
    [InlineData("""{"username":"x-user","email":"x@example.com","password":"Sup3rSecret!","role":"superuser"}""")]
    [InlineData("""{"username":"x-user","email":"x@example.com","password":"Sup3rSecret!","role":7}""")]
    public async Task Creating_a_user_with_an_unknown_role_is_rejected(string json)
    {
        var admin = await factory.CreateSignedInClientAsync("admin", ApiFactory.SeedPassword);

        var response = await admin.PostAsync("/api/v1/users", new StringContent(json, System.Text.Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
