namespace pj_backend.Models.Seeders;

public class SeedManager
{
  private readonly AppDbContext _context;

  public SeedManager(AppDbContext context)
  {
    _context = context;
  }

  public void SeedAll()
  {

    var userSeeder = new UserSeeder(_context);
    userSeeder.Seed();

    var gameSeeder = new GameSeeder(_context);
    gameSeeder.Seed();

  }
}
