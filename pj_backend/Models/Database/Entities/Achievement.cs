namespace pj_backend.Models.Database.Entities;

public class Achievement
{
  public int AchievementId { get; set; }
  public string Description { get; set; }
  public string Name { get; set; }
  public ICollection<UserAchievement> UserAchievements { get; set; }
}
