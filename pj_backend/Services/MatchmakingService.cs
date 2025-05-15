using pj_backend.WS;
using System.Collections.Concurrent;
namespace pj_backend.Services;

public class MatchmakingService
{
    private readonly WSConnectionManager _manager;
    private readonly ConcurrentQueue<string> _matches = new ConcurrentQueue<string>();

    public MatchmakingService(WSConnectionManager manager)
    {
        _manager = manager;
    }

    public async Task TryMatchmaking(string wsId)
    {
       
        _matches.Enqueue(wsId);
        if (_matches.Count >= 2)
        {
            if (_matches.TryDequeue(out var first) && _matches.TryDequeue(out var second))
            {
                await SendRivalInfo(first, second);
            }
        }
    }

    public async Task SendRivalInfo(string ws1 ,string ws2)
    {
        WSMessage wsMessage1 = new WSMessage();
        WSMessage wsMessage2 = new WSMessage();

        wsMessage1.Type = "RivalFound";
        wsMessage1.Data = ws2;

        wsMessage2.Type = "RivalFound";
        wsMessage2.Data = ws1;

        await _manager.SendMessageAsync(ws1 ,wsMessage1);
        await _manager.SendMessageAsync(ws2 ,wsMessage2);
    }
}
