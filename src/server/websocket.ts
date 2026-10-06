import { WebSocketServer, WebSocket } from 'ws';

export interface TacticalSocketEvent {
  event: string;
  data: unknown;
  timestamp: string;
}

export class IntelligenceWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number = 3001) {
    try {
      this.wss = new WebSocketServer({ port });
      console.log(`[MIRRIX-WS] Tactical Real-Time WebSocket listening on port ${port}`);

      this.wss.on('connection', (ws: WebSocket) => {
        this.clients.add(ws);
        console.log(`[MIRRIX-WS] Client connected. Total active connections: ${this.clients.size}`);

        // Initial handshake
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

        ws.on('message', (message: string) => {
          try {
            const parsed = JSON.parse(message.toString());
            this.handleClientMessage(ws, parsed);
          } catch (e) {
            console.error('[MIRRIX-WS] Malformed socket message:', e);
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
        });
      });
    } catch (err) {
      console.warn('[MIRRIX-WS] WebSocket standalone server init skipped (Port might be busy):', err);
    }
  }

  public broadcast(event: string, data: unknown) {
    const payload = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  private handleClientMessage(ws: WebSocket, msg: { type: string; payload?: unknown }) {
    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
    }
  }
}
