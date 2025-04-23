using System.Diagnostics;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using pj_backend.WS;

namespace pj_backend.Services
{
    public class WSService
    {
        public WSService(WSConnectionManager manager)
        {
            _manager = manager;
        }

        private readonly WSConnectionManager _manager;
        public async Task MessageSwitch(string socketId, WSMessage message)
        {
            var msgType = message.Type;
            switch (msgType)
            {
                case "GlobalMessage":
                    await _manager.BroadcastAsync(socketId, message);
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
