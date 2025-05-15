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

    public async Task<bool> ExistEmail(string email)
    {
        email = email.ToLower();
        User user = await GetQueryable().FirstOrDefaultAsync(user => user.Email == email);
        if (user == null)
        {
            return false;
        }
        return true;
    }
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<bool> ToggleRoleAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Rol = user.Rol == "Admin" ? "User" : "Admin";
        return true;
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        _context.Users.Remove(user);
        return true;
    }
}


