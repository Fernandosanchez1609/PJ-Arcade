using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.EntityFrameworkCore;
using System.Configuration;
using pj_backend.Models.Database.Entities;


public class AppDbContext : DbContext
{

    private const string DATABASE_PATH = "pj-arcade.db";

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
