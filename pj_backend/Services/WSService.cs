using System.Diagnostics;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using pj_backend.WS;

namespace pj_backend.Services
{
    public class WSService
    {
        public WSService(WSConnectionManager manager, MatchmakingService matchmaking, FriendshipService friendService)
        {
            _manager = manager;
            _matchmaking = matchmaking;
            _friendService = friendService;
        }

        private readonly WSConnectionManager _manager;
        private readonly MatchmakingService _matchmaking;
        private readonly FriendshipService _friendService;
        public async Task MessageSwitch(string socketId, WSMessage message)
        {
            var msgType = message.Type;
            var jsonEl = (JsonElement)message.Data;
            switch (msgType)
            {
                case "GlobalMessage":
                    await _manager.ExcludeBroadcastAsync(socketId, message);
                    break;
                case "Identify":
                    var userId = jsonEl.GetProperty("userId").GetString();
                    var onlineFriends = await GetFriendsOnline(userId);
                    _manager.IdentifySocket(socketId, userId);
                    _manager.SetUserOnline(userId);
                    await _manager.SendMessageAsync(socketId, new WSMessage
                    {
                        Type = "FriendsOnlineList",
                        Data = onlineFriends
                    });
                    await NotifyFriendsUserConnected(userId);
                    break;
                case "RequestAcepted":
                    var notifiAcepted = jsonEl.GetString();
                    onlineFriends = await GetFriendsOnline(notifiAcepted);
                    await _manager.SendMessageToUserAsync(notifiAcepted, new WSMessage {
                        Type = "FriendsOnlineList",
                        Data = onlineFriends
                    });
                    break;
                case "Unidentify":
                    var uid = jsonEl.GetProperty("userId").GetString();
                    _manager.UnidentifySocket(socketId);
                    _manager.SetUserOffline(uid);
                    await NotifyFriendsUserDisconnected(uid);
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

        private async Task NotifyFriendsUserConnected(string userId)
        {
            var friends = await _friendService.GetFriendIdsAsync(userId);
            var msg = new WSMessage
            {
                Type = "FriendOnline",
                Data = new { userId }
            };

            foreach (var friendId in friends)
            {
                await _manager.SendMessageToUserAsync(friendId, msg);
            }
        }

        private async Task NotifyFriendsUserDisconnected(string userId)
        {
            var friends = await _friendService.GetFriendIdsAsync(userId);
            var msg = new WSMessage
            {
                Type = "FriendOffline",
                Data = new { userId }
            };

            foreach (var friendId in friends)
            {
                await _manager.SendMessageToUserAsync(friendId, msg);
            }
        }

        public async Task<List<string>> GetFriendsOnline(string userId)
        {
            var friends = await _friendService.GetFriendIdsAsync(userId);
            var onlineFriends = new List<string>();

            foreach (var friendId in friends)
            {
                if (_manager.IsUserOnline(friendId))
                {
                    onlineFriends.Add(friendId);
                }
            }

            return onlineFriends;
        }

        public async Task DisconnectSocketAsync(string socketId)
        {
            
            await _manager.RemoveSocketAsync(socketId);

            var userId = _manager.GetUserIdWithSocket(socketId);
            if (userId != null)
            {
                await NotifyFriendsUserDisconnected(userId);
            }
        }

        public async Task SendByUserId(int userId, WSMessage message)
        {
            string id = userId.ToString();
            await _manager.SendMessageToUserAsync(id, message);
        }
    }
}
