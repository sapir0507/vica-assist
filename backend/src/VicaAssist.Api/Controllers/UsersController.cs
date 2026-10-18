using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VicaAssist.Api.Authorization;
using VicaAssist.Api.Interfaces;
using VicaAssist.Api.Models.Users;

namespace VicaAssist.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize(Policy = Policies.AdminOnly)]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<UserResponse>> List(CancellationToken cancellationToken) =>
        userService.ListAsync(cancellationToken);

    /// <summary>Creates a user with any role. This is how agents and further admins get an account.</summary>
    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await userService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, user);
    }
}
