using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace VicaAssist.Api.Services;

/// <summary>Random bearer secrets (refresh and reset tokens). Only their SHA-256 hash is stored.</summary>
public static class OpaqueToken
{
    public static string Generate() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    // A fast hash is enough here: the tokens are 256 random bits, so there is nothing to brute-force.
    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
