using pj_backend.Models.Database.Entities;
using pj_backend.Utilities;

namespace pj_backend.Models.Seeders;

public class UserSeeder
{
  private readonly AppDbContext _context;

  public UserSeeder(AppDbContext context) {  _context = context; }

  public void Seed()
  {
    if (_context.Users.Any())
    {
      Console.WriteLine("Usuarios ya existen en la base de datos, no se insertarán duplicados.");
      return;
    }

    var users = new List<User>
        {
            new User
            {
                UserId = 1,
                Name = "Admin",
                Email = "project4rcade@gmail.com",
                HashPassword = PasswordHelper.Hash("PJarcade"),
                Rol = "Admin",
            },
        };
    }
  }
