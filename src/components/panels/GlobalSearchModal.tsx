'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Video, AlertTriangle, Hospital, Shield, MapPin, Navigation, Crosshair } from 'lucide-react';
import { CameraSource, Incident, POI } from '@/types/intelligence';
import { formatTacticalCoordinates, parseCoordinateInput } from '@/lib/spatial';
import { tacticalAudio } from '@/lib/tacticalAudio';

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

interface GlobalSearchModalProps {
  onClose: () => void;
  onFlyTo: (lat: number, lng: number) => void;
  onSelectCamera: (cam: CameraSource) => void;
  onSelectIncident: (inc: Incident) => void;
  allCameras: CameraSource[];
  allIncidents: Incident[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onClose,
  onFlyTo,
  onSelectCamera,
  onSelectIncident,
  allCameras,
  allIncidents,
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check if query is coordinate input (e.g. "13.756331, 100.501762")
    const parsedCoords = parseCoordinateInput(query);
    if (parsedCoords) {
      setResults([
        {
          id: 'coord-target',
          category: 'COORDINATE',
          type: 'EXACT COORDINATES',
          title: `TARGET COORDINATES: ${parsedCoords.lat.toFixed(6)}° N, ${parsedCoords.lng.toFixed(6)}° E`,
          subtitle: 'Direct Geographic Coordinates Jump',
          district: 'Bangkok / Global',
          latitude: parsedCoords.lat,
          longitude: parsedCoords.lng,
        },
      ]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.results || []);
        }
      } catch {
        // Fallback local search
        const q = query.toLowerCase();
        const matches: SearchResultItem[] = [];
        allCameras.forEach((c) => {
          if (c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q)) {
            matches.push({
              id: c.id,
              category: 'CAMERA',
              type: c.source_type,
              title: c.name,
              subtitle: `${c.provider} • ${c.status}`,
              district: c.district,
              latitude: c.latitude,
              longitude: c.longitude,
            });
          }
        });
        allIncidents.forEach((i) => {
          if (i.title.toLowerCase().includes(q) || i.district.toLowerCase().includes(q)) {
            matches.push({
              id: i.id,
              category: 'INCIDENT',
              type: i.type,
              title: i.title,
              subtitle: `${i.severity} • ${i.source}`,
              district: i.district,
              latitude: i.latitude,
              longitude: i.longitude,
            });
          }
        });
        setResults(matches);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, allCameras, allIncidents]);

  const handleSelect = (item: SearchResultItem) => {
    tacticalAudio.playRadarBlip();
    onFlyTo(item.latitude, item.longitude);

    if (item.category === 'CAMERA') {
      const match = allCameras.find((c) => c.id === item.id);
      if (match) onSelectCamera(match);
    } else if (item.category === 'INCIDENT') {
      const match = allIncidents.find((i) => i.id === item.id);
      if (match) onSelectIncident(match);
    }

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div className="search-modal" aria-label="Global Spatial Search">
      <div className="search-input-wrap">
        <Search size={18} color="#00f0ff" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="SEARCH SECTORS, COORDINATES (13.7563, 100.5017), CAMERAS, POIS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="search-results-list">
        {loading && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#8b949e', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            SCANNING GEOSPATIAL VECTOR INDEX...
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6e7681', fontSize: '12px' }}>
            No geospatial targets found matching &quot;{query}&quot;. Try typing coordinates e.g. &quot;13.756331, 100.501762&quot;.
          </div>
        )}

        {results.map((item) => (
          <div
            key={`${item.category}-${item.id}`}
            className="search-result-row"
            onClick={() => handleSelect(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background:
                    item.category === 'COORDINATE'
                      ? 'rgba(0, 240, 255, 0.15)'
                      : item.category === 'CAMERA'
                      ? 'rgba(0, 255, 102, 0.1)'
                      : item.category === 'INCIDENT'
                      ? 'rgba(255, 51, 102, 0.1)'
                      : 'rgba(2, 132, 199, 0.1)',
                }}
              >
                {item.category === 'COORDINATE' ? (
                  <Crosshair size={15} color="#00f0ff" />
                ) : item.category === 'CAMERA' ? (
                  <Video size={14} color="#00ff66" />
                ) : item.category === 'INCIDENT' ? (
                  <AlertTriangle size={14} color="#ff3366" />
                ) : (
                  <MapPin size={14} color="#0284c7" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f6fc' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                  {item.subtitle} &bull; <span style={{ color: '#00f0ff' }}>{item.district}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6e7681' }}>
              <div>{item.type}</div>
              <div style={{ color: '#00f0ff' }}>
                {formatTacticalCoordinates(item.latitude, item.longitude, 4)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
