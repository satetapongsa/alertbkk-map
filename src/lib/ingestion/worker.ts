import { AdapterRegistry } from './adapters';
import { SourceRegistry, CameraSourceRegistry, IncidentSourceRegistry } from './registry';
import { HealthMonitor } from './healthMonitor';
import { IncidentDeduplicationPipeline } from './deduplication';
import { DataAgeEngine } from './dataAge';
import { RedisCacheEngine } from './cache';

export type WorkerEventListener = (event: string, payload: unknown) => void;

/**
 * ============================================================================
 * 14. BACKGROUND INGESTION WORKER
 * Orchestrates periodic ingestion, health monitoring, deduplication,
 * and real-time event broadcasting across all public intelligence sources.
 * ============================================================================
 */
export class BackgroundIngestionWorker {
  private static instance: BackgroundIngestionWorker;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private cycleCount: number = 0;
  private lastCycleTime: string = '';
  private listeners: Set<WorkerEventListener> = new Set();

  private constructor() {}

  public static getInstance(): BackgroundIngestionWorker {
    if (!BackgroundIngestionWorker.instance) {
      BackgroundIngestionWorker.instance = new BackgroundIngestionWorker();
    }
    return BackgroundIngestionWorker.instance;
  }

  public subscribe(listener: WorkerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcast(event: string, payload: unknown) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload);
      } catch (e) {
        console.error('[Worker Broadcast Error]:', e);
      }
    }
  }

  /**
   * Run one full ingestion cycle.
   */
  public async runCycle(): Promise<{ success: boolean; cycle: number; elapsedMs: number }> {
    const startTime = Date.now();
    const adapterRegistry = AdapterRegistry.getInstance();
    const sourceRegistry = SourceRegistry.getInstance();
    const cameraRegistry = CameraSourceRegistry.getInstance();
    const incidentRegistry = IncidentSourceRegistry.getInstance();
    const healthMonitor = HealthMonitor.getInstance();
    const cache = RedisCacheEngine.getInstance();

    this.cycleCount++;
    this.lastCycleTime = new Date().toISOString();

    try {
      // 1. Run Health Checks across public sources & cameras
      await healthMonitor.checkAllSources();
      await healthMonitor.checkAllCameras();

      // 2. Poll Public Adapters
      for (const adapter of adapterRegistry.getAllAdapters()) {
        // Ingest Cameras
        if (adapter.fetchCameras) {
          const camResult = await adapter.fetchCameras();
          if (camResult.success && camResult.data) {
            for (const cam of camResult.data) {
              cam.data_age = DataAgeEngine.classifyAge(cam.last_checked || Date.now());
              cameraRegistry.registerCamera(cam);
            }
          }
        }

        // Ingest Incidents
        if (adapter.fetchIncidents) {
          const incResult = await adapter.fetchIncidents();
          if (incResult.success && incResult.data) {
            const currentIncidents = incidentRegistry.getAllIncidents();

            for (const candidate of incResult.data) {
              const candidateTime = candidate.reported_at || candidate.first_seen || new Date().toISOString();
              const matched = IncidentDeduplicationPipeline.findDuplicateMatch(
                {
                  raw_title: candidate.title,
                  raw_description: candidate.description,
                  latitude: candidate.latitude,
                  longitude: candidate.longitude,
                  reported_at: candidateTime,
                  source: candidate.source || adapter.name,
                  source_url: candidate.source_url,
                },
                currentIncidents
              );

              if (matched) {
                // Deduplicate and merge
                const merged = IncidentDeduplicationPipeline.mergeIncident(matched, {
                  raw_title: candidate.title,
                  raw_description: candidate.description,
                  latitude: candidate.latitude,
                  longitude: candidate.longitude,
                  reported_at: candidateTime,
                  source: candidate.source || adapter.name,
                  source_url: candidate.source_url,
                });
                const updatedTime = merged.last_updated || merged.updated_at || new Date().toISOString();
                merged.data_age = DataAgeEngine.classifyAge(updatedTime);
                merged.age_formatted = DataAgeEngine.formatAge(updatedTime);
                incidentRegistry.upsertIncident(merged);
                this.broadcast('incident.updated', merged);
              } else {
                // New Incident
                const createdTime = candidate.first_seen || candidate.reported_at || new Date().toISOString();
                candidate.data_age = DataAgeEngine.classifyAge(createdTime);
                candidate.age_formatted = DataAgeEngine.formatAge(createdTime);
                incidentRegistry.registerIncident(candidate);
                this.broadcast('incident.created', candidate);
              }
            }
          }
        }
      }

      // 3. Invalidate API caches for fresh data
      await cache.invalidateNamespace('api:');

      // 4. Emit Heartbeat & Telemetry update
      this.broadcast('telemetry.heartbeat', {
        cycle: this.cycleCount,
        timestamp: this.lastCycleTime,
        camerasCount: cameraRegistry.getAllCameras().length,
        incidentsCount: incidentRegistry.getAllIncidents().length,
        sourcesCount: sourceRegistry.getAllSources().length,
      });

      return {
        success: true,
        cycle: this.cycleCount,
        elapsedMs: Date.now() - startTime,
      };
    } catch (err) {
      console.error('[Ingestion Worker Cycle Error]:', err);
      return {
        success: false,
        cycle: this.cycleCount,
        elapsedMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Start recurring background worker loop.
   */
  public startWorker(intervalMs: number = 30000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run first cycle immediately
    this.runCycle().catch(() => {});

    // Schedule subsequent cycles
    this.timer = setInterval(() => {
      this.runCycle().catch(() => {});
    }, intervalMs);
  }

  public stopWorker(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      lastCycleTime: this.lastCycleTime,
    };
  }
}
