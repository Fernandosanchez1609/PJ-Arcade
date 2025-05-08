using pj_backend.Models.Database.Dtos;
using pj_backend.Models.Database.Entities;

public static class GameMapper
{
    public static GameDTO ToDTO(Game game)
    {
        return new GameDTO
        {
            GameId = game.GameId,
            Name = game.Name,
            Description = game.Description,
            imgURL = game.imgURL
        };
    }

    public static ICollection<GameDTO> ToDTOList(ICollection<Game> games)
    {
        return games.Select(ToDTO).ToList();
    }
}
