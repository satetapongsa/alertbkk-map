import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CameraStatus, CameraType } from '@/types/intelligence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || undefined;
    const status = searchParams.get('status') ? (searchParams.get('status')!.split(',') as CameraStatus[]) : undefined;
    const type = searchParams.get('type') ? (searchParams.get('type')!.split(',') as CameraType[]) : undefined;
    const query = searchParams.get('q') || undefined;

    const cameras = db.getCameras({
      selectedDistrict: district,
      cameraStatuses: status,
      cameraTypes: type,
      searchQuery: query,
    });

    return NextResponse.json({
      success: true,
      count: cameras.length,
      data: cameras,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
