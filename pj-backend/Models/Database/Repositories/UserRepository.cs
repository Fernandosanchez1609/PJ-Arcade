using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;

public class UserRepository : Repository<User, int>
{
  private readonly AppDbContext _context;

  public UserRepository(AppDbContext context) : base(context)
  {
    _context = context;
  }

  public async Task<User?> GetByEmailAsync(string email)
  {
    return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
  }
}
