using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace pj_backend.WS
{
  public class WSConnectionManager
  {
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

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

    public async Task SendMessageAsync(string socketId, string message)
    {
      if (_sockets.TryGetValue(socketId, out var socket))
      {
        var buffer = Encoding.UTF8.GetBytes(message);
        await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
      }
    }
  }
}
