using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Entities.enums;
using pj_backend.Models.Database.Entities;
using System.Linq.Expressions;

namespace pj_backend.Models.Database.Repositories;

public class FriendshipRepository
{
    private readonly AppDbContext _context;

    public FriendshipRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Friendship?> GetFriendshipAsync(int userId1, int userId2)
    {
        return await _context.Set<Friendship>()
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId1 && f.AddresseeId == userId2) ||
                (f.RequesterId == userId2 && f.AddresseeId == userId1));
    }

    public async Task AddAsync(Friendship friendship)
    {
        await _context.Set<Friendship>().AddAsync(friendship);
    }

    public async Task<List<Friendship>> GetPendingRequestsAsync(int userId)
    {
        return await _context.Set<Friendship>()
            .Where(f => f.AddresseeId == userId && f.Status == FriendshipStatus.Pending)
            .Include(f => f.Requester)
            .ToListAsync();
    }

    public async Task<Friendship?> GetByIdAsync(int id)
    {
        return await _context.Set<Friendship>().FindAsync(id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<List<Friendship>> GetAllAsync(
    Expression<Func<Friendship, bool>> predicate,
    string[]? include = null)
    {
        var query = _context.Friendships.AsQueryable();

        if (include != null)
        {
            foreach (var inc in include)
                query = query.Include(inc);
        }

        return await query.Where(predicate).ToListAsync();
    }

}

