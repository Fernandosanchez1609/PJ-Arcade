using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;


namespace pj_backend.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;

    public UserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task UpdateUserBD(int userId, User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user), "El objeto user no puede ser nulo.");
        }

        User existingUser = await _unitOfWork.UserRepository.GetByIdAsync(userId) ?? throw new KeyNotFoundException("Usuario no encontrado.");

        UpdateUserProperties(existingUser, user);

        await _unitOfWork.SaveAsync();
    }

    private static void UpdateUserProperties(User existingUser, User user)
    {
        if (!string.IsNullOrEmpty(user.Name) && user.Name != existingUser.Name)
        {
            existingUser.Name = user.Name;
        }

        if (!string.IsNullOrEmpty(user.Email) && user.Email != existingUser.Email)
        {
            existingUser.Email = user.Email;
        }
    }


}

