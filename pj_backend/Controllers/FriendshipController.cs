using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using pj_backend.Services;
using pj_backend.Models.Database.Dtos;

namespace pj_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendshipController : ControllerBase
{
    private readonly FriendshipService _service;

    public FriendshipController(FriendshipService service)
    {
        _service = service;
    }

   
    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendshipRequestDto dto)
    {
        int requesterId = GetUserId();

        if (dto.RequesterId != requesterId)
            return Forbid("No puedes enviar solicitudes como otro usuario");

        var result = await _service.SendFriendRequestAsync(dto.RequesterId, dto.AddresseeId);
        return result ? Ok("Solicitud enviada") : BadRequest("No se pudo enviar la solicitud");
    }

    [HttpPost("accept/{id}")]
    public async Task<IActionResult> AcceptFriendRequest(int id)
    {
        int userId = GetUserId();

        var result = await _service.AcceptRequestAsync(id, userId);
        return result ? Ok("Solicitud aceptada") : NotFound("No puedes aceptar esta solicitud");
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        int userId = GetUserId();

        var requests = await _service.GetPendingRequestsAsync(userId);
        return Ok(requests.Select(f => new {
            f.Id,
            Requester = new { f.Requester.UserId, f.Requester.Name },
            f.Status
        }));
    }

    [HttpGet("list")]
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

}
