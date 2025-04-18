namespace pj_backend.Models.Database.Entities;

public class UserAchievement
{
  public int AchievementId { get; set; }
  public Achievement Achievement { get; set; }

  public int UserId { get; set; }
  public User User { get; set; }

  public DateTime DateAchieved { get; set; }

}
