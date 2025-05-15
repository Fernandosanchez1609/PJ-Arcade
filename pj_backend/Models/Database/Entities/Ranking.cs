namespace pj_backend.Models.Database.Entities;

public class Ranking
{
  public int RankingId { get; set; }
  public int GameId { get; set; }
  public Game Game { get; set; }

  public int UserId { get; set; }
  public User User { get; set; }

  public int MaxScore { get; set; } = 0;
}
