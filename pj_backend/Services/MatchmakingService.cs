using pj_backend.WS;
using System.Collections.Generic;

namespace pj_backend.Services;

public class MatchmakingService
{
    private readonly WSConnectionManager _manager;
    private readonly List<string> _waitingPlayers = new();
    private readonly object _lock = new();

    public MatchmakingService(WSConnectionManager manager)
    {
        _manager = manager;
    }

    public async Task TryMatchmaking(string wsId)
    {
        lock (_lock)
        {
            if (!_waitingPlayers.Contains(wsId))
            {
                _waitingPlayers.Add(wsId);
            }

            if (_waitingPlayers.Count >= 2)
            {
                var first = _waitingPlayers[0];
                var second = _waitingPlayers[1];
                _waitingPlayers.RemoveRange(0, 2);

                // Ejecutamos el emparejamiento fuera del lock
                _ = SendRivalInfo(first, second);
            }
        }
    }

    public void RemovePlayer(string wsId)
    {
        lock (_lock)
        {
            _waitingPlayers.Remove(wsId);
        }
    }

    public async Task SendRivalInfo(string ws1, string ws2)
    {
        var wsMessage1 = new WSMessage
        {
            Type = "RivalFound",
            Data = new
            {
                RivalId = ws2,
                Role = "Player1"
            }
        };

        var wsMessage2 = new WSMessage
        {
            Type = "RivalFound",
            Data = new
            {
                RivalId = ws1,
                Role = "Player2"
            }
        };

        await _manager.SendMessageAsync(ws1, wsMessage1);
        await _manager.SendMessageAsync(ws2, wsMessage2);
    }
}
