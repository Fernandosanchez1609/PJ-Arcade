using System.Net.WebSockets;
using System.Text;
using pj_backend.WS;
using pj_backend.Services;
namespace pj_backend.Middleware;

public class WSMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WSConnectionManager _manager;
    private readonly WSService _service;

    public WSMiddleware(RequestDelegate next, WSConnectionManager manager, WSService service)
    {
        _next = next;
        _manager = manager;
        _service = service;
    }


    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
        {
            var socket = await context.WebSockets.AcceptWebSocketAsync();
            var socketId = _manager.AddSocket(socket);

            await _manager.BroadcastAsync(new WSMessage
            {
                Type = "onlineCount",
                Data = _manager.OnlineCount
            });

            await Receive(socket, async (result, buffer) =>
            {
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    WSMessage msg = new WSMessage
                    {
                        Type = "GlobalMessage",
                        Data = message
                    };

                    await _service.MessageSwitch(msg);

                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await _manager.RemoveSocketAsync(socketId);
                    await _manager.BroadcastAsync(new WSMessage
                    {
                        Type = "onlineCount",
                        Data = _manager.OnlineCount
                    });
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
