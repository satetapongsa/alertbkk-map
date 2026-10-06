'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, X, Plus, Trash2, MapPin, Navigation } from 'lucide-react';
import { Bookmark as BookmarkType } from '@/types/intelligence';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface BookmarksModalProps {
  currentCenter: [number, number]; // [lng, lat]
  onClose: () => void;
  onFlyTo: (lat: number, lng: number, zoom: number) => void;
}

const DEFAULT_BOOKMARKS: BookmarkType[] = [
  { id: 'bm-siam', label: 'SIAM / PATHUM WAN', description: 'Central Commercial & Transit Nexus', lat: 13.7466, lng: 100.5348, zoom: 15 },
  { id: 'bm-sukhumvit', label: 'SUKHUMVIT / ASOK', description: 'High-Density Corridor & BTS/MRT Interchange', lat: 13.7372, lng: 100.5604, zoom: 15 },
  { id: 'bm-rama9', label: 'RAMA IX / RATCHADA', description: 'Financial District & Highway Interchange', lat: 13.7578, lng: 100.5658, zoom: 15 },
  { id: 'bm-airport', label: 'SUVARNABHUMI AIRPORT', description: 'International Air Hub & Perimeter', lat: 13.6900, lng: 100.7501, zoom: 13.5 },
  { id: 'bm-chatuchak', label: 'CHATUCHAK / BANG SUE', description: 'Northern Transit Hub & Railway Grand Station', lat: 13.8034, lng: 100.5404, zoom: 14.5 },
  { id: 'bm-bangna', label: 'BANG NA EXPRESSWAY', description: 'Eastern Logistics & Flood Control Sector', lat: 13.6678, lng: 100.6052, zoom: 14 },
];

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  currentCenter,
  onClose,
  onFlyTo,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(DEFAULT_BOOKMARKS);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mirrix_saved_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveBookmarksToStorage = (bms: BookmarkType[]) => {
    setBookmarks(bms);
    try {
      localStorage.setItem('mirrix_saved_bookmarks', JSON.stringify(bms));
    } catch {}
  };

  const handleAddCurrent = () => {
    if (!newLabel.trim()) return;
    tacticalAudio.playRadarBlip();
    const newBm: BookmarkType = {
      id: `bm-${Date.now()}`,
      label: newLabel.toUpperCase(),
      description: 'Custom Saved Tactical Location',
      lat: Number(currentCenter[1].toFixed(6)),
      lng: Number(currentCenter[0].toFixed(6)),
      zoom: 15,
    };
    const updated = [newBm, ...bookmarks];
    saveBookmarksToStorage(updated);
    setNewLabel('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    tacticalAudio.playClick();
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarksToStorage(updated);
  };

  return (
    <div className="search-modal" role="dialog" aria-modal="true" style={{ width: '480px' }}>
      <div className="panel-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-cyan)' }}>
        <div className="panel-header-title">
          <Bookmark size={16} color="#00f0ff" />
          <span>TACTICAL BOOKMARKS &bull; SAVED LOCATIONS</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close [Esc]">
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Add Current Location */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            className="search-input"
            style={{ flex: 1, padding: '8px 10px', fontSize: '11px' }}
            placeholder="LABEL FOR CURRENT MAP CENTER..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCurrent()}
          />
          <button
            className="tactical-pill-btn cyan"
            style={{ padding: '8px 12px' }}
            onClick={handleAddCurrent}
            disabled={!newLabel.trim()}
          >
            <Plus size={14} />
            <span>SAVE CENTER</span>
          </button>
        </div>

        {/* Bookmarks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto' }}>
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              onClick={() => {
                tacticalAudio.playRadarBlip();
                onFlyTo(bm.lat, bm.lng, bm.zoom);
                onClose();
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#f0f6fc', fontWeight: '700' }}>{bm.label}</div>
                <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                  {bm.description} &bull; {bm.lat.toFixed(4)}° N, {bm.lng.toFixed(4)}° E
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={13} color="#00f0ff" />
                <button
                  style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', padding: '4px' }}
                  onClick={(e) => handleDelete(bm.id, e)}
                  title="Delete bookmark"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
