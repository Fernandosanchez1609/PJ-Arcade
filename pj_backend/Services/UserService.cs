using pj_backend.Utilities;
using BCrypt.Net;
using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;
using RegisterRequest = pj_backend.Models.Database.Dtos.RegisterRequest;
using pj_backend.Models.Database.Dtos;


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

    public async Task<User> RegisterAsync(RegisterRequest request)
    {

        // Crear el nuevo usuario
        var newUser = new User
        {
            Name = request.Name,
            Email = request.Email,
            HashPassword = PasswordHelper.Hash(request.Password),
            Rol = "User",
        };

        // Insertar el usuario en la base de datos
        await _unitOfWork.UserRepository.InsertAsync(newUser);
        await _unitOfWork.SaveAsync();

        return newUser;
    }

    public async Task<(User? user, string? error)> AuthenticateAsync(string email, string password)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(email);
        if (user == null)
            return (null, "Correo o contraseña incorrectos.");

        if (user.IsBanned)
            return (null, "Tu cuenta ha sido baneada.");

        var hashedInput = PasswordHelper.Hash(password);
        if (user.HashPassword != hashedInput)
            return (null, "Correo o contraseña incorrectos.");

        return (user, null);
    }


    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.UserRepository.GetAllAsync();
        return UserMapper.ToDTOList(users);
    }

    public async Task<bool> ToggleUserRoleAsync(int userId)
    {
        var result = await _unitOfWork.UserRepository.ToggleRoleAsync(userId);
        if (!result) return false;

        await _unitOfWork.SaveAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var deleted = await _unitOfWork.UserRepository.DeleteAsync(userId);
        if (!deleted) return false;

        await _unitOfWork.SaveAsync();
        return true;
    }

    public async Task<bool?> ToggleUserBanAsync(int userId)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        user.IsBanned = !user.IsBanned;
        await _unitOfWork.SaveAsync();

        return user.IsBanned;
    }


}

