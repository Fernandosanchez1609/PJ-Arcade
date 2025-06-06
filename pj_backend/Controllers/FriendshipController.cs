using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using pj_backend.Services;
using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities.enums;
using pj_backend.Models.Database.Mapper;
using pj_backend.WS;

namespace pj_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendshipController : ControllerBase
{
    private readonly FriendshipService _service;
    private readonly WSService _wsService;
    private readonly UserService _userService;
    public FriendshipController(FriendshipService service, WSService wsService, UserService userService)
    {
        _service = service;
        _wsService = wsService;
        _userService = userService;
    }

   
    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendshipRequestDto dto)
    {
        int requesterId = GetUserId();

        string requesterName = await _userService.GetUserNameById(requesterId);

        var result = await _service.SendFriendRequestAsync(requesterId, dto.AddresseeId);
        WSMessage message = new WSMessage { Data =$"{requesterName} te ha mandado una solicitud de amistad" ,Type = "RequestRecived"};

        await _wsService.SendByUserId(dto.AddresseeId, message);
        return result ? Ok("Solicitud enviada") : BadRequest("No se pudo enviar la solicitud");
    }


    [HttpPost("accept/{id}")]
    public async Task<IActionResult> AcceptFriendRequest(int id)
    {
        int userId = GetUserId();

        var result = await _service.AcceptRequestAsync(id, userId);
       
        return result ? Ok("Solicitud aceptada") : NotFound("No puedes aceptar esta solicitud");
    }

    [HttpPost("reject/{id}")]
    public async Task<IActionResult> RejectFriendRequest(int id)
    {
        int userId = GetUserId();

        var result = await _service.RejectRequestAsync(id, userId);
        return result ? Ok("Solicitud rechazada") : NotFound("No puedes rechazar esta solicitud");
    }


    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        int userId = GetUserId();
        var pendingRequests = await _service.GetAllAsync(
                    f => f.AddresseeId == userId && f.Status == FriendshipStatus.Pending,
                    new[] { "Requester", "Addressee" }
                );
        return Ok(FriendshipMapper.ToDTOList(pendingRequests));
    }


    [HttpGet("friends")]
    public async Task<IActionResult> GetFriends()
    {
        int userId = GetUserId();

        var friends = await _service.GetFriendsAsync(userId);

        var result = friends.Select(f =>
        {
            var friend = f.RequesterId == userId ? f.Addressee : f.Requester;
            return new
            {
                friend.UserId,
                friend.Name
            };
        });

        return Ok(result);
    }

    [HttpGet("pending/sent")]
    public async Task<IActionResult> GetPendingSentRequests()
    {
        int userId = GetUserId();

        var pendingRequests = await _service.GetAllAsync(
            f => f.RequesterId == userId && f.Status == FriendshipStatus.Pending,
            new[] { "Requester", "Addressee" }
        );

        return Ok(FriendshipMapper.ToDTOList(pendingRequests));
    }


}
