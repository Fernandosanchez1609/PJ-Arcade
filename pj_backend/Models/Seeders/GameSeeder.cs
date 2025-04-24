using pj_backend.Models.Database.Entities;
using pj_backend.Utilities;

namespace pj_backend.Models.Seeders;

public class GameSeeder
{

    private readonly AppDbContext _context;

    public GameSeeder(AppDbContext context) { _context = context; }
    public void Seed()
    {
        if (_context.Games.Any())
        {
            Console.WriteLine("Usuarios ya existen en la base de datos, no se insertarán duplicados.");
            return;
        }
        var games = new List<Game>
        {
            new Game
            {
               GameId = 1,
               Name = "Worms",
               Description = "Juego guapardo de gusanitos guerrilleros con increíbles armas que causan turbo explosiones",
            },
        };

        _context.Games.AddRange(games);
        _context.SaveChanges();

    }
}