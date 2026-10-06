import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create an SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection packet
      const initMessage = `data: ${JSON.stringify({
        event: 'system.connected',
        timestamp: new Date().toISOString(),
        status: 'ONLINE',
        mode: 'REAL_TIME_STREAM',
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // Periodic heartbeat and realistic telemetry tick
      const interval = setInterval(() => {
        try {
          const telemetryTick = `data: ${JSON.stringify({
            event: 'telemetry.heartbeat',
            timestamp: new Date().toISOString(),
            zulu: new Date().toISOString().substring(11, 19) + 'Z',
          })}\n\n`;
          controller.enqueue(encoder.encode(telemetryTick));
        } catch {
          clearInterval(interval);
        }
      }, 5000);

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
