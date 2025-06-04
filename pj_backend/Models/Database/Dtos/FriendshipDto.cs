namespace pj_backend.Models.Database.Dtos;

public class FriendshipDto
{
    public int Id { get; set; }
    public ProfileDto Requester { get; set; }
    public ProfileDto Addressee { get; set; }
}
