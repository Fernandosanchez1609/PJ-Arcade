using System.Diagnostics;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using pj_backend.WS;

namespace pj_backend.Services
{
    public class WSService
    {
        public WSService(WSConnectionManager manager, MatchmakingService matchmaking)
        {
            _manager = manager;
            _matchmaking = matchmaking;
        }

        private readonly WSConnectionManager _manager;
        private readonly MatchmakingService _matchmaking;
        public async Task MessageSwitch(string socketId, WSMessage message)
        {
            var msgType = message.Type;
            var jsonEl = (JsonElement)message.Data;
            switch (msgType)
            {
                case "GlobalMessage":
                    await _manager.ExcludeBroadcastAsync(socketId, message);
                    break;
                case "Matchmaking":
                    await _matchmaking.TryMatchmaking(socketId);
                    break;
                case "RivalInfo":
                    var targetSocketId = jsonEl.GetProperty("socketId").GetString();
                    await _manager.SendMessageAsync(targetSocketId, message);
                    break;
                case "PrivateMessage":
                    var reciverId = jsonEl.GetProperty("socketId").GetString();
                    await _manager.SendMessageAsync(reciverId, message);
                    break;
                case "Atack":
                    var rival = jsonEl.GetProperty("socketId").GetString();
                    await _manager.SendMessageAsync(rival, message);
                    break;
                case "Error":
                    await _manager.SendMessageAsync(socketId, message);
                    break;
                default:

                    break;
            }
        }

    }
}
