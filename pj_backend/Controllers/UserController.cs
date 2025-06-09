using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;
using pj_backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using RegisterRequest = pj_backend.Models.Database.Dtos.RegisterRequest;

namespace pj_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly TokenValidationParameters _tokenParameters;
    private readonly UserService _userService;
    private UnitOfWork _unitOfWork;

    public UserController(IOptionsMonitor<JwtBearerOptions> jwtOptions, UserService userService, UnitOfWork unitOfWork)
    {
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme)
                .TokenValidationParameters;
        _userService = userService;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AccessTokenJws>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            bool existingUser = await _unitOfWork.UserRepository.ExistEmail(request.Email);

            if (existingUser)
            {
                return BadRequest("Correo electrónico en uso.");
            }
            var newUser = await _userService.RegisterAsync(request);
            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {

                Claims = new Dictionary<string, object>
        {
            { "id", newUser.UserId.ToString() },
            { "name", newUser.Name.ToString() },
            { "email", newUser.Email.ToString() },
            { ClaimTypes.Role, newUser.Rol }
        },

                // Aquí indicamos cuándo caduca el token
                Expires = DateTime.UtcNow.AddSeconds(3000),
                // Aquí especificamos nuestra clave y el algoritmo de firmado
                SigningCredentials = new SigningCredentials(
                       _tokenParameters.IssuerSigningKey,
                       SecurityAlgorithms.HmacSha256Signature)
            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
            string accessToken = tokenHandler.WriteToken(token);

            return Ok(new AccessTokenJws { AccessToken = accessToken }); // Devuelve 200 OK con el usuario creado
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AccessTokenJws>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var (user, error) = await _userService.AuthenticateAsync(request.Email, request.Password);

            if (user == null)
            {
                return Unauthorized(error); 
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
            {
                { "id", user.UserId.ToString() },
                { "name", user.Name.ToString() },
                { "email", user.Email.ToString() },
                { ClaimTypes.Role, user.Rol }
            },
                Expires = DateTime.UtcNow.AddSeconds(3000),
                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(token);

            return Ok(new AccessTokenJws { AccessToken = accessToken });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpGet("AllUsers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener usuarios: {ex.Message}");
        }
    }

    [HttpPut("toggle-role/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleUserRole(int id)
    {
        var success = await _userService.ToggleUserRoleAsync(id);
        if (!success) return NotFound("Usuario no encontrado.");

        return Ok("Rol actualizado.");
    }

    [HttpDelete("Delete/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var success = await _userService.DeleteUserAsync(id);
        if (!success)
            return NotFound(new { message = "Usuario no encontrado." });

        return NoContent();
    }

    [HttpPut("ban/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BanOrUnbanUser(int id)
    {
        var result = await _userService.ToggleUserBanAsync(id);

        if (!result.HasValue)
            return NotFound("Usuario no encontrado.");

        var mensaje = result.Value ? "Usuario baneado." : "Usuario desbaneado.";
        return Ok(mensaje);
    }

    [HttpGet("profiles")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ProfileDto>>> GetAllUserProfiles()
    {
        try
        {
            var profiles = await _userService.GetAllUserProfilesAsync();
            return Ok(profiles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener los perfiles: {ex.Message}");
        }
    }

}
