import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCoordinateInput } from '@/lib/spatial';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ success: true, count: 0, results: [] });
    }

    const coords = parseCoordinateInput(q);
    if (coords) {
      return NextResponse.json({
        success: true,
        count: 1,
        results: [
          {
            id: 'coord-target',
            category: 'COORDINATE',
            type: 'GEOGRAPHIC COORDINATE',
            title: `TARGET COORDINATES: ${coords.lat.toFixed(6)}° N, ${coords.lng.toFixed(6)}° E`,
            subtitle: 'Direct Geographic Target Navigation',
            district: 'Bangkok / Global',
            latitude: coords.lat,
            longitude: coords.lng,
          },
        ],
      });
    }

    const { cameras, incidents, pois } = db.searchEntities(q);

    interface SearchResultItem {
      id: string;
      category: 'CAMERA' | 'INCIDENT' | 'POI' | 'COORDINATE';
      type: string;
      title: string;
      subtitle: string;
      district: string;
      latitude: number;
      longitude: number;
    }

    const results: SearchResultItem[] = [];

    cameras.forEach((c) => {
      results.push({
        id: c.id,
        category: 'CAMERA',
        type: c.source_type,
        title: c.name,
        subtitle: `${c.provider} • ${c.status}`,
        district: c.district,
        latitude: c.latitude,
        longitude: c.longitude,
      });
    });

    incidents.forEach((i) => {
      results.push({
        id: i.id,
        category: 'INCIDENT',
        type: i.type,
        title: i.title,
        subtitle: `${i.severity} Severity • Reported by ${i.source}`,
        district: i.district,
        latitude: i.latitude,
        longitude: i.longitude,
      });
    });

    pois.forEach((p) => {
      results.push({
        id: p.id,
        category: 'POI',
        type: p.type,
        title: p.name,
        subtitle: p.address,
        district: p.district,
        latitude: p.latitude,
        longitude: p.longitude,
      });
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
