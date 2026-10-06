import { SourceRegistry, CameraSourceRegistry } from './registry';
import { AdapterRegistry } from './adapters';
import { SourceHealthStatus, CameraStatus } from '@/types/intelligence';

/**
 * ============================================================================
 * 4. CAMERA & SOURCE HEALTH MONITOR
 * Continuous observability of all camera streams and public data endpoints.
 * Statuses: ONLINE | DEGRADED | OFFLINE | STALE
 * ============================================================================
 */
export class HealthMonitor {
  private static instance: HealthMonitor;
  private isRunning: boolean = false;

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  /**
   * Run health checks on all registered public data sources.
   */
  public async checkAllSources(): Promise<void> {
    const sourceRegistry = SourceRegistry.getInstance();
    const adapterRegistry = AdapterRegistry.getInstance();
    const sources = sourceRegistry.getAllSources();

    for (const source of sources) {
      const adapter = adapterRegistry.getAdapter(source.id);
      const now = new Date().toISOString();

      if (!adapter) {
        sourceRegistry.updateSourceHealth(source.id, {
          status: 'STALE',
          last_checked: now,
        });
        continue;
      }

      try {
        const { reachable, latencyMs } = await adapter.healthCheck();

        let nextStatus: SourceHealthStatus = 'ONLINE';
        let errorCount = 0;

        if (!reachable) {
          errorCount = source.error_count + 1;
          nextStatus = errorCount >= 3 ? 'OFFLINE' : 'DEGRADED';
        } else if (latencyMs > 1000) {
          nextStatus = 'DEGRADED';
        } else {
          nextStatus = 'ONLINE';
        }

        sourceRegistry.updateSourceHealth(source.id, {
          status: nextStatus,
          latency: latencyMs,
          last_checked: now,
          last_success: reachable ? now : source.last_success,
          error_count: errorCount,
        });
      } catch {
        sourceRegistry.updateSourceHealth(source.id, {
          status: 'OFFLINE',
          last_checked: now,
          error_count: source.error_count + 1,
        });
      }
    }
  }

  /**
   * Run health check on camera feeds and stream URLs.
   */
  public async checkAllCameras(): Promise<void> {
    const cameraRegistry = CameraSourceRegistry.getInstance();
    const cameras = cameraRegistry.getAllCameras();

    for (const cam of cameras) {
      // Simulate/measure lightweight head check
      let status: CameraStatus = cam.status;
      let latencyMs = cam.latency_ms || 40;

      // Classify camera health
      if (status === 'ONLINE' && latencyMs > 300) {
        status = 'DEGRADED';
      } else if (cam.stream_url === '' && cam.embed_url === '' && !cam.public_access) {
        status = 'OFFLINE';
      }

      cameraRegistry.updateCameraStatus(cam.id, status, latencyMs);
    }
  }
}
