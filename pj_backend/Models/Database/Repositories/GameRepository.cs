using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;
using pj_backend.Models.Database.Dtos;

public class GameRepository : Repository<Game, int>
{
    private readonly AppDbContext _context;

    public GameRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<ICollection<Game>> GetAllGamesAsync()
    {
        return await _context.Set<Game>().ToListAsync();
    }
}
