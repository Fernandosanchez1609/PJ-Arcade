namespace pj_backend.Models.Database.Entities;
public class Game
{
  public int GameId { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  public string imgURL { get; set; }
  public ICollection<GameMatch> Matches { get; set; }
  public ICollection<Ranking> Rankings { get; set; }
}
