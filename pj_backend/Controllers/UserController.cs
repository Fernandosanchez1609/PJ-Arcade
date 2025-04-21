using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using pj_backend.Models.Database.Dtos;
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
      var user = await _userService.AuthenticateAsync(request.Email, request.Password);
      if (user == null)
      {
        return Unauthorized("Correo o contraseña incorrectos. user null");
      }

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Claims = new Dictionary<string, object>
      {
        { "id", user.UserId.ToString() },
        { "name", user.Name.ToString() },
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

}
