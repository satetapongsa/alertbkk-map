import { NextResponse } from 'next/server';
import { SourceRegistry } from '@/lib/ingestion/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const registry = SourceRegistry.getInstance();
    const sources = registry.getAllSources();

    const summary = {
      online: sources.filter((s) => s.status === 'ONLINE').length,
      degraded: sources.filter((s) => s.status === 'DEGRADED').length,
      offline: sources.filter((s) => s.status === 'OFFLINE').length,
      stale: sources.filter((s) => s.status === 'STALE').length,
      total: sources.length,
    };

    return NextResponse.json({
      success: true,
      summary,
      data: sources,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
