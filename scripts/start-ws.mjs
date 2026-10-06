import { WebSocketServer, WebSocket } from 'ws';

const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

const wss = new WebSocketServer({ port });
console.log(`[MIRRIX-WS] Tactical Real-Time WebSocket listening on port ${port}`);

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[MIRRIX-WS] Client connected. Total active connections: ${clients.size}`);

  ws.send(
    JSON.stringify({
      event: 'system.welcome',
      data: {
        server: 'MIRRIX REAL-TIME INTELLIGENCE BUS',
        region: 'Bangkok / Global Core',
        timestamp: new Date().toISOString(),
      },
    })
  );

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (e) {
      console.error('[MIRRIX-WS] Malformed message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Periodic broadcast
setInterval(() => {
  const payload = JSON.stringify({
    event: 'telemetry.tick',
    zulu: new Date().toISOString().substring(11, 19) + 'Z',
    entities: 58352,
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}, 3000);
