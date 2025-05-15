using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities;

public class GameService
{
    private readonly GameRepository _gameRepository;

    public GameService(GameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<ICollection<GameDTO>> GetAllGamesAsync()
    {
        var games = await _gameRepository.GetAllGamesAsync();
        return GameMapper.ToDTOList(games);
    }
}
