import { NextRequest } from 'next/server';
import { BackgroundIngestionWorker } from '@/lib/ingestion/worker';
import { SourceRegistry, CameraSourceRegistry, IncidentSourceRegistry } from '@/lib/ingestion/registry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const worker = BackgroundIngestionWorker.getInstance();
  const cameraRegistry = CameraSourceRegistry.getInstance();
  const incidentRegistry = IncidentSourceRegistry.getInstance();
  const sourceRegistry = SourceRegistry.getInstance();

  // Make sure worker is active in background
  worker.startWorker(30000);

  // Create an SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Handshake Message
      const initMessage = `data: ${JSON.stringify({
        event: 'system.connected',
        timestamp: new Date().toISOString(),
        status: 'ONLINE',
        mode: 'REAL_TIME_STREAM',
        data: {
          cameras: cameraRegistry.getAllCameras().length,
          incidents: incidentRegistry.getAllIncidents().length,
          sources: sourceRegistry.getAllSources().length,
        },
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // 2. Subscribe to background ingestion pipeline events
      const unsubscribe = worker.subscribe((event, payload) => {
        try {
          const msg = `data: ${JSON.stringify({
            event,
            data: payload,
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(msg));
        } catch {
          // Stream might be closed
        }
      });

      // 3. Periodic heartbeat tick (every 5s)
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
          unsubscribe();
        }
      }, 5000);

      // 4. Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
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
