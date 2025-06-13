using System.Net.WebSockets;
using System.Text;
using pj_backend.WS;
using pj_backend.Services;
using System.Text.Json;

namespace pj_backend.Middleware;

public class WSMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WSConnectionManager _manager;
    private readonly IServiceScopeFactory _scopeFactory;

    public WSMiddleware(RequestDelegate next, WSConnectionManager manager, IServiceScopeFactory scopeFactory)
    {
        _next = next;
        _manager = manager;
        _scopeFactory = scopeFactory;
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

            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<WSService>();

            await Receive(socket, async (result, buffer) =>
            {
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    WSMessage msg;

                    try
                    {
                        msg = JsonSerializer.Deserialize<WSMessage>(message) ?? new WSMessage
                        {
                            Type = "Error",
                            Data = "Mensaje nulo"
                        };
                    }
                    catch
                    {
                        msg = new WSMessage
                        {
                            Type = "Error",
                            Data = "Error: el formato del mensaje es incorrecto"
                        };
                    }

                    await service.MessageSwitch(socketId, msg);
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await service.DisconnectSocketAsync(socketId);
                    var matchmakingService = scope.ServiceProvider.GetRequiredService<MatchmakingService>();
                    matchmakingService.RemovePlayer(socketId);
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
