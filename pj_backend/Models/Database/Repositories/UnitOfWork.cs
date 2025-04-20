using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database;
using pj_backend.Services;

namespace pj_backend.Models.Database.Repositories;

public class UnitOfWork
{
    private readonly AppDbContext _AppDbContext;
    private UserRepository _userRepository;

    public UserRepository UserRepository => _userRepository ??= new UserRepository(_AppDbContext);

    public UnitOfWork(AppDbContext myDbContext)
    {
        _AppDbContext = myDbContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _AppDbContext.SaveChangesAsync() > 0;
    }
}