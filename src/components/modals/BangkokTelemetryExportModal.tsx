'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode2,
  FileSpreadsheet,
  Layers,
  Database,
  Shield,
  Activity,
} from 'lucide-react';
import {
  BANGKOK_PUMP_TRUCKS,
  BANGKOK_RELIEF_DEPOTS,
  BANGKOK_HOSPITALS,
  BANGKOK_POWER_SUBSTATIONS,
  BANGKOK_PET_SHELTERS,
  BANGKOK_WATERWAYS,
} from '@/lib/bkk-environmental-data';

interface BangkokTelemetryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents?: any[];
}

export const BangkokTelemetryExportModal: React.FC<BangkokTelemetryExportModalProps> = ({
  isOpen,
  onClose,
  incidents = [],
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'GEOJSON' | 'CSV'>('GEOJSON');
  const [selectedDataset, setSelectedDataset] = useState<string>('ALL');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Build GeoJSON Feature Collections
  const generateGeoJson = (datasetKey: string) => {
    const features: any[] = [];

    // Helper to create GeoJSON Feature
    const addFeature = (id: string, name: string, category: string, lat: number, lng: number, properties: Record<string, any>) => {
      features.push({
        type: 'Feature',
        id,
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          id,
          name,
          category,
          latitude: lat,
          longitude: lng,
          ...properties,
        },
      });
    };

    if (datasetKey === 'ALL' || datasetKey === 'INCIDENTS') {
      incidents.forEach((inc) => {
        addFeature(inc.id, inc.title, 'INCIDENT', inc.latitude, inc.longitude, {
          type: inc.type,
          severity: inc.severity,
          district: inc.district,
          locationName: inc.locationName,
          status: inc.status,
          confirmCount: inc.confirmCount,
          createdAt: inc.createdAt,
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'PUMPS') {
      BANGKOK_PUMP_TRUCKS.forEach((pump) => {
        addFeature(pump.id, pump.unitCode, 'PUMP_TRUCK', pump.lat, pump.lng, {
          locationName: pump.locationName,
          district: pump.district,
          capacityLps: pump.pumpCapacityLps,
          status: pump.status,
          statusTh: pump.statusTh,
          dischargingTo: pump.dischargingTo,
          contactTel: pump.contactTel,
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'DEPOTS') {
      BANGKOK_RELIEF_DEPOTS.forEach((depot) => {
        addFeature(depot.id, depot.officeName, 'SANDBAG_DEPOT', depot.lat, depot.lng, {
          district: depot.district,
          sandbagStock: depot.sandbagStock,
          sandbagStatus: depot.sandbagStatus,
          sandbagStatusTh: depot.sandbagStatusTh,
          contactTel: depot.contactTel,
          services: depot.services.join('; '),
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'HOSPITALS') {
      BANGKOK_HOSPITALS.forEach((hosp) => {
        addFeature(hosp.id, hosp.name, 'HOSPITAL', hosp.lat, hosp.lng, {
          district: hosp.district,
          traumaLevel: hosp.traumaLevel,
          emergencyPhone: hosp.emergencyTel,
          erBedStatus: hosp.erBedStatus,
          erBedStatusTh: hosp.erBedStatusTh,
          floodBarrierMsl: hosp.floodBarrierMsl,
          accessStatus: hosp.accessStatus,
          accessStatusTh: hosp.accessStatusTh,
          generatorBackupHours: hosp.generatorBackupHours,
          helipadReady: hosp.helipadReady,
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'POWER') {
      BANGKOK_POWER_SUBSTATIONS.forEach((sub) => {
        addFeature(sub.id, sub.name, 'POWER_SUBSTATION', sub.lat, sub.lng, {
          meaDistrict: sub.meaDistrict,
          voltageKv: sub.voltageKv,
          floodBarrierMsl: sub.floodBarrierMsl,
          status: sub.status,
          statusTh: sub.statusTh,
          servicingZone: sub.servicingZone,
          contactTel: sub.contactTel,
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'PET_SHELTERS') {
      BANGKOK_PET_SHELTERS.forEach((shelter) => {
        addFeature(shelter.id, shelter.name, 'PET_SHELTER', shelter.lat, shelter.lng, {
          district: shelter.district,
          organization: shelter.organization,
          petCapacity: shelter.petCapacity,
          acceptedAnimals: shelter.acceptedAnimals.join(', '),
          intakeStatus: shelter.intakeStatus,
          intakeStatusTh: shelter.intakeStatusTh,
          vetOnDuty: shelter.vetOnDuty,
          contactTel: shelter.contactTel,
        });
      });
    }

    if (datasetKey === 'ALL' || datasetKey === 'WATERWAYS') {
      BANGKOK_WATERWAYS.forEach((pier) => {
        addFeature(pier.id, pier.name, 'CANAL_PIER', pier.lat, pier.lng, {
          waterwayName: pier.waterwayName,
          waterwayType: pier.waterwayType,
          district: pier.district,
          serviceStatus: pier.serviceStatus,
          serviceStatusTh: pier.serviceStatusTh,
          connectingTransit: pier.connectingTransit,
          operatingHours: pier.operatingHours,
        });
      });
    }

    return {
      type: 'FeatureCollection',
      name: `AlertBKK_${datasetKey}_Telemetry`,
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
      },
      features,
    };
  };

  // Build CSV Format
  const generateCsv = (datasetKey: string) => {
    const geoJson = generateGeoJson(datasetKey);
    const rows: string[] = [];

    // Header
    rows.push('ID,Name,Category,Latitude,Longitude,District,Status,Details');

    geoJson.features.forEach((feat: any) => {
      const p = feat.properties;
      const details = Object.entries(p)
        .filter(([k]) => !['id', 'name', 'category', 'latitude', 'longitude', 'district', 'status'].includes(k))
        .map(([k, v]) => `${k}:${v}`)
        .join('; ')
        .replace(/"/g, '""');

      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

      rows.push([
        escape(p.id),
        escape(p.name),
        escape(p.category),
        p.latitude,
        p.longitude,
        escape(p.district || ''),
        escape(p.status || ''),
        `"${details}"`,
      ].join(','));
    });

    return rows.join('\r\n');
  };

  const getExportData = () => {
    if (selectedFormat === 'GEOJSON') {
      return JSON.stringify(generateGeoJson(selectedDataset), null, 2);
    } else {
      return generateCsv(selectedDataset);
    }
  };

  const handleDownload = () => {
    const content = getExportData();
    const mimeType = selectedFormat === 'GEOJSON' ? 'application/geo+json' : 'text/csv;charset=utf-8;';
    const extension = selectedFormat === 'GEOJSON' ? 'geojson' : 'csv';
    const filename = `alertbkk-${selectedDataset.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    const content = getExportData();
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const currentFeaturesCount = generateGeoJson(selectedDataset).features.length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Disaster Telemetry Export Center
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  GIS / WGS84
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Export verified Bangkok flood telemetry, relief points, and emergency resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Export Data Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('GEOJSON')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  selectedFormat === 'GEOJSON'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileCode2 className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs">GeoJSON Format (*.geojson)</div>
                  <div className="text-[10px] text-slate-400">
                    Industry standard for QGIS, ArcGIS, Mapbox, and Leaflet layers with WGS84 coordinates.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('CSV')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  selectedFormat === 'CSV'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs">CSV Spreadsheet (*.csv)</div>
                  <div className="text-[10px] text-slate-400">
                    Tabular format for Microsoft Excel, Google Sheets, dispatch logs, and field briefings.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Dataset Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Telemetry Layer</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ALL', label: 'All Layers (Unified)', count: 'Master' },
                { id: 'INCIDENTS', label: 'Incidents & Floods', count: `${incidents.length} points` },
                { id: 'PUMPS', label: 'Pump Trucks', count: `${BANGKOK_PUMP_TRUCKS.length} units` },
                { id: 'DEPOTS', label: 'Sandbag Depots', count: `${BANGKOK_RELIEF_DEPOTS.length} depots` },
                { id: 'HOSPITALS', label: 'Trauma Hospitals', count: `${BANGKOK_HOSPITALS.length} hospitals` },
                { id: 'POWER', label: 'Power Grid', count: `${BANGKOK_POWER_SUBSTATIONS.length} stations` },
                { id: 'PET_SHELTERS', label: 'Pet Shelters', count: `${BANGKOK_PET_SHELTERS.length} shelters` },
                { id: 'WATERWAYS', label: 'Canal Boat Piers', count: 'All piers' },
              ].map((ds) => (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => setSelectedDataset(ds.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedDataset === ds.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{ds.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ds.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Summary Stats */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <Layers className="w-4 h-4" />
              <span>Features in Dataset: {currentFeaturesCount}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>CRS: EPSG:4326 (WGS84)</span>
            </div>
          </div>

          {/* Raw Code Preview Box */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Telemetry Data Stream Preview</span>
              <span className="font-mono text-[10px] text-slate-500">Live UTF-8 Buffer</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 max-h-40 overflow-y-auto whitespace-pre-wrap select-all">
              {getExportData().slice(0, 1500)}
              {getExportData().length > 1500 ? '\n... [Remaining data truncated in preview]' : ''}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Data</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download File ({selectedFormat})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
