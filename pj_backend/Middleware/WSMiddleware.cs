using System.Net.WebSockets;
using System.Text;
using pj_backend.WS;
namespace pj_backend.Middleware;

public class WSMiddleware
{
  private readonly RequestDelegate _next;
  private readonly WSConnectionManager _manager;

  public WSMiddleware(RequestDelegate next, WSConnectionManager manager)
  {
    _next = next;
    _manager = manager;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
      var socket = await context.WebSockets.AcceptWebSocketAsync();
      var socketId = _manager.AddSocket(socket);

      await Receive(socket, async (result, buffer) =>
      {
        if (result.MessageType == WebSocketMessageType.Text)
        {
          var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
          Console.WriteLine($"Mensaje recibido de {socketId}: {message}");
          await _manager.SendMessageAsync(socketId, $"Eco: {message}");
        }
        else if (result.MessageType == WebSocketMessageType.Close)
        {
          await _manager.RemoveSocketAsync(socketId);
        }
      });
      return;
    }

    await _next(context);
  }


  private async Task Receive(WebSocket socket, Func<WebSocketReceiveResult, byte[], Task> handleMessage)
  {
    var buffer = new byte[1024 * 4];
    while (socket.State == WebSocketState.Open)
    {
      var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
      await handleMessage(result, buffer);
    }
  }
}
