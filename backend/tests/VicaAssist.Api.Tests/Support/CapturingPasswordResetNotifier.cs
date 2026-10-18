using System.Collections.Concurrent;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Tests.Support;

/// <summary>Stands in for the email provider and keeps the reset tokens, which only the "email" would reveal.</summary>
public sealed class CapturingPasswordResetNotifier : IPasswordResetNotifier
{
    private readonly ConcurrentQueue<(string Username, string Token)> _sent = new();

    public int SentCount => _sent.Count;

    public Task SendAsync(User user, string resetToken, CancellationToken cancellationToken)
    {
        _sent.Enqueue((user.Username, resetToken));
        return Task.CompletedTask;
    }

    public string LastTokenFor(string username) =>
        _sent.Last(entry => entry.Username == username).Token;
}
