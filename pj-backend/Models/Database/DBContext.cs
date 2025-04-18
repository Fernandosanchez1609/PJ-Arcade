using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Entities;


public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
  {
  }

  public DbSet<User> Users { get; set; }
  public DbSet<Game> Games { get; set; }
  public DbSet<GameMatch> GameMatches { get; set; }
  public DbSet<Ranking> Rankings { get; set; }
  public DbSet<Achievement> Achievements { get; set; }
  public DbSet<UserAchievement> UserAchievements { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    // Composite keys
    modelBuilder.Entity<Ranking>()
        .HasKey(r => new { r.GameId, r.UserId });

    modelBuilder.Entity<UserAchievement>()
        .HasKey(ua => new { ua.AchievementId, ua.UserId });

    // One-to-many relationship for Host
    modelBuilder.Entity<GameMatch>()
        .HasOne(m => m.HostUser)
        .WithMany(u => u.HostedMatches)
        .HasForeignKey(m => m.HostUserId)
        .OnDelete(DeleteBehavior.Restrict);

    // One-to-many relationship for Guest
    modelBuilder.Entity<GameMatch>()
        .HasOne(m => m.GuestUser)
        .WithMany(u => u.JoinedMatches)
        .HasForeignKey(m => m.GuestUserId)
        .OnDelete(DeleteBehavior.Restrict);
  }
}
