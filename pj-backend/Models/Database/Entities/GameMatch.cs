namespace pj_backend.Models.Database.Entities;

public class GameMatch
{
  public int GameMatchId { get; set; }
  public DateTime Date { get; set; }

  public int GameId { get; set; }
  public Game Game { get; set; }

  public int HostUserId { get; set; }
  public User HostUser { get; set; }

  public int GuestUserId { get; set; }
  public User GuestUser { get; set; }
}
