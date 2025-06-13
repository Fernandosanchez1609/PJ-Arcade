namespace pj_backend.Models.Database.Entities;
public class User
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string HashPassword { get; set; }
    public string Rol { get; set; }
    public bool IsBanned { get; set; }
    public ICollection<GameMatch> HostedMatches { get; set; }
    public ICollection<GameMatch> JoinedMatches { get; set; }
    public ICollection<Ranking> Rankings { get; set; }
    public ICollection<UserAchievement> UserAchievements { get; set; }
    public ICollection<Friendship> RequestedFriendships { get; set; }
    public ICollection<Friendship> ReceivedFriendships { get; set; }

}