using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace pj_backend.WS
{
  public class WSConnectionManager
  {
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
    public int OnlineCount => _sockets.Count;


    public string AddSocket(WebSocket socket)
    {
      string id = Guid.NewGuid().ToString();
      _sockets.TryAdd(id, socket);
      return id;
    }

    public async Task RemoveSocketAsync(string id)
    {
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

    public async Task BroadcastAsync(string excludeId, WSMessage message)
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


  }
}
