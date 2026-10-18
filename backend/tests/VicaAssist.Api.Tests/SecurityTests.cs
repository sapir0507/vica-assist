using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using VicaAssist.Api.Tests.Support;

namespace VicaAssist.Api.Tests;

public sealed class SecurityTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static string CreateAdminToken(string signingKey, string issuer = "vica-assist-api")
    {
        return new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = issuer,
            Audience = "vica-assist-app",
            Expires = DateTime.UtcNow.AddMinutes(5),
            Subject = new ClaimsIdentity(
            [
                new Claim("sub", "1"),
                new Claim("name", "admin"),
                new Claim("role", "admin")
            ]),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(signingKey)), SecurityAlgorithms.HmacSha256)
        });
    }

    private async Task<HttpStatusCode> GetUsersWith(string token)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return (await client.GetAsync("/api/v1/users")).StatusCode;
    }

    [Fact]
    public async Task A_token_signed_with_the_servers_key_is_accepted()
    {
        Assert.Equal(HttpStatusCode.OK, await GetUsersWith(CreateAdminToken(factory.SigningKey)));
    }

    [Fact]
    public async Task A_token_signed_with_another_key_is_rejected_even_when_it_claims_to_be_admin()
    {
        var forged = CreateAdminToken("a-different-signing-key-0123456789-abcdef");

        Assert.Equal(HttpStatusCode.Unauthorized, await GetUsersWith(forged));
    }

    [Fact]
    public async Task A_token_from_another_issuer_is_rejected()
    {
        var token = CreateAdminToken(factory.SigningKey, issuer: "someone-else");

        Assert.Equal(HttpStatusCode.Unauthorized, await GetUsersWith(token));
    }

    [Fact]
    public async Task A_garbled_token_is_rejected()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, await GetUsersWith("not.a.jwt"));
    }

    [Fact]
    public async Task The_openapi_document_declares_the_bearer_scheme()
    {
        var document = await factory.CreateClient().GetStringAsync("/openapi/v1.json");

        Assert.Contains("\"bearer\"", document);
        Assert.Contains("/api/v1/auth/login", document);
    }

    [Fact]
    public async Task Too_many_login_attempts_are_throttled()
    {
        using var strictFactory = new ApiFactory { AuthRequestsPerMinute = 3 };
        var client = strictFactory.CreateClient();

        var statuses = new List<HttpStatusCode>();
        for (var attempt = 0; attempt < 5; attempt++)
        {
            statuses.Add((await client.TryLoginAsync("admin", "wrong-password")).StatusCode);
        }

        Assert.Equal(
            [.. Enumerable.Repeat(HttpStatusCode.Unauthorized, 3), HttpStatusCode.TooManyRequests, HttpStatusCode.TooManyRequests],
            statuses);
    }
}
