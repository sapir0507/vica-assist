using VicaAssist.Api.Enums;
using VicaAssist.Api.Models.PasswordReset;
using VicaAssist.Api.Models.Users;
using VicaAssist.Api.Validators;

namespace VicaAssist.Api.Tests;

public sealed class ValidatorTests
{
    private static async Task<string[]> ErrorsFor(CreateUserRequest request, string field) =>
        [.. (await new CreateUserRequestValidator().ValidateAsync(request, CancellationToken.None))
            .Where(error => error.Field == field)
            .Select(error => error.Message)];

    private static CreateUserRequest User(string username = "valid-user", string email = "someone@example.com", string password = "Sup3rSecret!") =>
        new(username, email, password, Role.Customer);

    [Fact]
    public async Task A_valid_request_has_no_errors()
    {
        var errors = await new CreateUserRequestValidator().ValidateAsync(User(), CancellationToken.None);

        Assert.Empty(errors);
    }

    [Theory]
    [InlineData("Blabla hotel")]
    [InlineData("agent.noam")]
    [InlineData("under_score-dash")]
    [InlineData("שרה")]
    public async Task Usernames_with_letters_digits_spaces_and_the_allowed_marks_are_accepted(string username)
    {
        Assert.Empty(await ErrorsFor(User(username), "Username"));
    }

    [Theory]
    [InlineData("admin@example.com")]
    [InlineData("a@b")]
    [InlineData("name!")]
    [InlineData("tab\tname")]
    public async Task Usernames_with_other_characters_are_rejected_and_an_at_sign_in_particular(string username)
    {
        Assert.Single(await ErrorsFor(User(username), "Username"));
    }

    [Fact]
    public async Task A_username_is_judged_without_the_spaces_around_it()
    {
        var errors = await ErrorsFor(User("  ab  "), "Username");

        Assert.Contains("at least 3", Assert.Single(errors));
    }

    [Theory]
    [InlineData("OnlyLettersHere", "digit")]
    [InlineData("1234567890", "letter")]
    public async Task A_password_needs_a_letter_and_a_digit(string password, string missing)
    {
        var errors = await ErrorsFor(User(password: password), "Password");

        Assert.Contains(missing, Assert.Single(errors));
    }

    [Theory]
    [InlineData("valid-user", "someone@example.com", "Xvalid-user1")]
    [InlineData("valid-user", "someone@example.com", "My-SOMEONE-1")]
    public async Task A_password_may_not_contain_the_username_or_the_email_name_in_any_case(string username, string email, string password)
    {
        var errors = await ErrorsFor(User(username, email, password), "Password");

        Assert.Contains("must not contain", Assert.Single(errors));
    }

    [Fact]
    public async Task A_very_short_email_name_is_not_held_against_the_password()
    {
        Assert.Empty(await ErrorsFor(User(email: "xy@example.com", password: "xy-Pass1word"), "Password"));
    }

    [Fact]
    public async Task Every_problem_is_reported_at_once()
    {
        var errors = await new CreateUserRequestValidator().ValidateAsync(User("a@b", password: "password"), CancellationToken.None);

        Assert.Equal(["Username", "Password"], errors.Select(error => error.Field).Distinct());
    }

    [Fact]
    public async Task A_reset_password_is_checked_against_the_generic_rules_under_its_own_field_name()
    {
        var validator = new ResetPasswordRequestValidator();

        var weak = await validator.ValidateAsync(new ResetPasswordRequest("token", "lettersonly"), CancellationToken.None);
        var strong = await validator.ValidateAsync(new ResetPasswordRequest("token", "N3w-Passw0rd"), CancellationToken.None);

        Assert.Equal("NewPassword", Assert.Single(weak).Field);
        Assert.Empty(strong);
    }
}
