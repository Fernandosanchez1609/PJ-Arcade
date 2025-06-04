using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities;

namespace pj_backend.Models.Database.Mapper;

public static class FriendshipMapper
{
    public static FriendshipDto ToDTO(Friendship friendship)
    {
        return new FriendshipDto
        {
            Id = friendship.Id,
            Requester = UserMapper.ToProfileDto(friendship.Requester),
            Addressee = UserMapper.ToProfileDto(friendship.Addressee),
        };
    }

    public static IEnumerable<FriendshipDto> ToDTOList(IEnumerable<Friendship> friendships)
        => friendships.Select(ToDTO);
}


