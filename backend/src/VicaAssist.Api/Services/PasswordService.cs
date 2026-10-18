using Microsoft.AspNetCore.Identity;

namespace VicaAssist.Api.Services;

/// <summary>Hashes and verifies passwords with ASP.NET Core's PBKDF2 <see cref="PasswordHasher{TUser}"/>.</summary>
public sealed class PasswordService
{
    // The default hasher ignores this argument; Identity's API just requires one.
    private static readonly object Subject = new();

    private readonly PasswordHasher<object> _hasher = new();
    private readonly string _decoyHash;

    public PasswordService()
    {
        _decoyHash = Hash("decoy password for unknown accounts");
    }

    public string Hash(string password) => _hasher.HashPassword(Subject, password);

    /// <param name="storedHash">The user's hash, or null when there is no such account.</param>
    public PasswordVerificationResult Verify(string? storedHash, string password)
    {
        if (storedHash is null)
        {
            // Spend the same time as a real check so response timing does not reveal which accounts exist.
            _hasher.VerifyHashedPassword(Subject, _decoyHash, password);
            return PasswordVerificationResult.Failed;
        }

        return _hasher.VerifyHashedPassword(Subject, storedHash, password);
    }
}
