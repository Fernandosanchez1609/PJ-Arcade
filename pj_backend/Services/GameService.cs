using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;

public class GameService
{
    private readonly GameRepository _gameRepository;

    public GameService(GameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<ICollection<Game>> GetAllGamesAsync()
    {
        return await _gameRepository.GetAllGamesAsync();
    }
}
