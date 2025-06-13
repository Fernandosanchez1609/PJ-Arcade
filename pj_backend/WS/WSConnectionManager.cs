
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace pj_backend.WS
{
    public class WSConnectionManager
    {
       

        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
        private readonly ConcurrentDictionary<string, List<string>> _userSockets = new();
        private readonly ConcurrentDictionary<string, string> _socketToUser = new();
        private readonly ConcurrentDictionary<string, bool> _connectedUsers = new();


        public int OnlineCount => _sockets.Count;


        public string AddSocket(WebSocket socket)
        {
            string id = Guid.NewGuid().ToString();
            _sockets.TryAdd(id, socket);
            return id;
        }

        public async Task RemoveSocketAsync(string id)
        {
            
            string userid = GetUserIdWithSocket(id);
            if (userid != null)
            {
                SetUserOffline(userid);
                UnidentifySocket(id);
            }

            

            if (_sockets.TryRemove(id, out var socket))
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Conexión cerrada", CancellationToken.None);
            }
            
        }

        public async Task SendMessageAsync(string socketId, WSMessage message)
        {
            if (_sockets.TryGetValue(socketId, out var socket))
            {
                var json = JsonSerializer.Serialize(message);
                var buffer = Encoding.UTF8.GetBytes(json);
                await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        public async Task ExcludeBroadcastAsync(string excludeId, WSMessage message)
        {
            var json = JsonSerializer.Serialize(message);
            var buffer = Encoding.UTF8.GetBytes(json);


            foreach (var sockets in _sockets)
            {
                var socketId = sockets.Key;
                var socket = sockets.Value;

                if (socketId == excludeId)
                {
                    continue;
                }

                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }

        public async Task BroadcastAsync(WSMessage message)
        {
            var json = JsonSerializer.Serialize(message);
            var buffer = Encoding.UTF8.GetBytes(json);


            foreach (var socket in _sockets.Values)
            {

                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }

        public void IdentifySocket(string socketId, string userId)
        {
            _socketToUser[socketId] = userId;

            _userSockets.AddOrUpdate(userId,
                _ => new List<string> { socketId },
                (_, list) =>
                {
                    lock (list)
                    {
                        list.Add(socketId);
                    }
                    return list;
                });
        }

        public void UnidentifySocket(string socketId)
        {
            if (_socketToUser.TryRemove(socketId, out var userId))
            {
                if (_userSockets.TryGetValue(userId, out var sockets))
                {
                    lock (sockets)
                    {
                        sockets.Remove(socketId);
                        if (sockets.Count == 0)
                            _userSockets.TryRemove(userId, out _);
                    }
                }
            }
        }



        public async Task SendMessageToUserAsync(string userId, WSMessage message)
        {
            if (_userSockets.TryGetValue(userId, out var socketIds) )
            {
                foreach (var socketId in socketIds)
                {
                    await SendMessageAsync(socketId, message);
                }
            }
        }

        public string GetUserIdWithSocket(string socketId)
        {
            if (_socketToUser.TryGetValue(socketId, out var userId))
            {
                return userId;
            }

            return null;
        }
        public void SetUserOnline(string userId)
        {
            _connectedUsers[userId] = true;
        }

        public void SetUserOffline(string userId)
        {
            _connectedUsers.TryRemove(userId, out _);
        }

        public bool IsUserOnline(string userId)
        {
            return _connectedUsers.ContainsKey(userId);
        }

        //no lo necesitamos por ahora

        //public IEnumerable<string> GetConnectedUserIds()
        //{
        //    return _connectedUsers.Keys;
        //}


    }
}
