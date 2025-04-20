using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.EntityFrameworkCore;
using System.Configuration;
using pj_backend.Models.Database.Entities;


public class AppDbContext : DbContext
{

    private const string DATABASE_PATH = "pj-arcade.db";

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

    //Configurar el proveedor de base de datos Sqlite

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        //AppDomain obtiene el directorio donde se ejecuta la aplicación
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        // Se configura Sqlite como proveedor de BD pasando la ruta de archivo ("vhypergames.db) en el directorio base de la aplicacion
        #if DEBUG
        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
        #elif RELEASE
        options.UseMySql(Environment.GetEnvironmentVariable("DB_CONFIG"), ServerVersion.AutoDetect(Environment.GetEnvironmentVariable("DB_CONFIG")));
        #endif
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        // Configuración de la tabla users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            // Configurar el Id como clave primaria
            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId)
                .HasColumnName("id")
                .IsRequired()
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.HashPassword)
                .HasColumnName("hash_password")
                .HasMaxLength(40)
                .IsRequired();

            entity.Property(e => e.Rol)
                .HasColumnName("rol")
                .IsRequired();

            // Índice único en el campo Email
            entity.HasIndex(e => e.Email)
                .IsUnique();
        });

        // Configuración de la tabla ranking
        modelBuilder.Entity<Ranking>(entity =>
       {
           entity.ToTable("ranking");

           entity.HasKey(e => e.RankingId);

           entity.Property(e => e.GameId)
                .HasColumnName("gameId")
                .IsRequired()
                .ValueGeneratedOnAdd();

           entity.Property(e => e.UserId)
                .HasColumnName("userId")
                .HasMaxLength(100)
                .IsRequired();

           entity.Property(e => e.MaxScore)
                .HasColumnName("maxScore")
                .IsRequired();
       });


        // Configuración de la tabla achievements
        modelBuilder.Entity<Achievement>(entity =>
       {
         entity.ToTable("achievements");

         // Configurar el AchievementId como clave primaria
         entity.HasKey(e => e.AchievementId);

         entity.Property(e => e.AchievementId)
          .HasColumnName("id")
          .IsRequired()
          .ValueGeneratedOnAdd();

         entity.Property(e => e.Name)
          .HasColumnName("name")
          .HasMaxLength(100)
          .IsRequired();

         entity.Property(e => e.Description)
          .HasColumnName("description")
          .HasMaxLength(255)
          .IsRequired();
       });

    // Configuración de la tabla game_matches
    modelBuilder.Entity<GameMatch>(entity =>
    {
      entity.ToTable("game_matches");

      // Clave primaria
      entity.HasKey(e => e.GameMatchId);

      entity.Property(e => e.GameMatchId)
          .HasColumnName("id")
          .IsRequired()
          .ValueGeneratedOnAdd();

      entity.Property(e => e.Date)
          .HasColumnName("date")
          .IsRequired();

      // Relaciones
      entity.Property(e => e.GameId)
          .HasColumnName("game_id")
          .IsRequired();

      entity.Property(e => e.HostUserId)
          .HasColumnName("host_user_id")
          .IsRequired();

      entity.Property(e => e.GuestUserId)
          .HasColumnName("guest_user_id")
          .IsRequired();

      // Relación con Game
      entity.HasOne(e => e.Game)
          .WithMany(g => g.Matches)
          .HasForeignKey(e => e.GameId)
          .OnDelete(DeleteBehavior.Cascade);

      // Relación con HostUser
      entity.HasOne(e => e.HostUser)
          .WithMany(u => u.HostedMatches)
          .HasForeignKey(e => e.HostUserId)
          .OnDelete(DeleteBehavior.Restrict);

      // Relación con GuestUser
      entity.HasOne(e => e.GuestUser)
          .WithMany(u => u.JoinedMatches)
          .HasForeignKey(e => e.GuestUserId)
          .OnDelete(DeleteBehavior.Restrict);
    });


    // Configuración de la tabla games
    modelBuilder.Entity<Game>(entity =>
    {
      entity.ToTable("games");

      // Clave primaria
      entity.HasKey(e => e.GameId);

      entity.Property(e => e.GameId)
          .HasColumnName("id")
          .IsRequired()
          .ValueGeneratedOnAdd();

      entity.Property(e => e.Name)
          .HasColumnName("name")
          .HasMaxLength(100)
          .IsRequired();

      entity.Property(e => e.Description)
          .HasColumnName("description")
          .HasMaxLength(500)
          .IsRequired();

      // Relaciones uno-a-muchos implícitas a GameMatch y Ranking
      entity.HasMany(e => e.Matches)
          .WithOne(m => m.Game)
          .HasForeignKey(m => m.GameId)
          .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(e => e.Rankings)
          .WithOne(r => r.Game)
          .HasForeignKey(r => r.GameId)
          .OnDelete(DeleteBehavior.Cascade);
    });

    // Configuración de la tabla user_achievements
    modelBuilder.Entity<UserAchievement>(entity =>
    {
      entity.ToTable("user_achievements");

      // Clave primaria
      entity.HasKey(e => e.Id);

      entity.Property(e => e.Id)
          .HasColumnName("id")
          .IsRequired()
          .ValueGeneratedOnAdd();

      entity.Property(e => e.AchievementId)
          .HasColumnName("achievement_id")
          .IsRequired();

      entity.Property(e => e.UserId)
          .HasColumnName("user_id")
          .IsRequired();

      entity.Property(e => e.DateAchieved)
          .HasColumnName("date_achieved")
          .IsRequired();

      // Relaciones
      entity.HasOne(e => e.Achievement)
          .WithMany(a => a.UserAchievements)
          .HasForeignKey(e => e.AchievementId)
          .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(e => e.User)
          .WithMany(u => u.UserAchievements)
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);
    });

  }
}
