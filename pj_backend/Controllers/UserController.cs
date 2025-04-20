using Microsoft.AspNetCore.Mvc;
using pj_backend.Models.Database.Entities;
using pj_backend.Services;
using RegisterRequest = pj_backend.Models.Database.Dtos.RegisterRequest;

namespace pj_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
  private readonly UserService _userService;

  public UserController(UserService userService)
  {
    _userService = userService;
  }

  [HttpPost("register")]
  public async Task<ActionResult<User>> Register([FromBody] RegisterRequest request)
  {
    try
    {
      var newUser = await _userService.RegisterAsync(request);
      return Ok(newUser); // Devuelve 200 OK con el usuario creado
    }
    catch (Exception ex)
    {
      return BadRequest(ex.Message);
    }
  }
}
