using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities;

public static class UserMapper
{
    public static UserDto ToDTO(User user)
    {
        return new UserDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Rol = user.Rol,
            IsBanned = user.IsBanned
        };
    }

    public static ICollection<UserDto> ToDTOList(ICollection<User> users)
    {
        return users.Select(ToDTO).ToList();
    }

    public static IEnumerable<UserDto> ToDTOList(IEnumerable<User> users)
    {
        return users.Select(ToDTO);
    }
}
