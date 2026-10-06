'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Calendar, FastForward } from 'lucide-react';
import { Incident } from '@/types/intelligence';
import { tacticalAudio } from '@/lib/tacticalAudio';

interface EventReplayDrawerProps {
  incidents: Incident[];
  onClose: () => void;
  onSelectIncident: (inc: Incident) => void;
  onFilterReplayIncidents: (activeIncidents: Incident[]) => void;
}

export const EventReplayDrawer: React.FC<EventReplayDrawerProps> = ({
  incidents,
  onClose,
  onSelectIncident,
  onFilterReplayIncidents,
}) => {
  const [timeWindow, setTimeWindow] = useState<'15M' | '1H' | '6H' | '24H'>('1H');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100); // 0 to 100%
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate window start time
  const now = Date.now();
  const windowMs =
    timeWindow === '15M'
      ? 15 * 60 * 1000
      : timeWindow === '1H'
      ? 60 * 60 * 1000
      : timeWindow === '6H'
      ? 6 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const startTime = now - windowMs;
  const currentReplayTime = startTime + (windowMs * progress) / 100;

  // Filter incidents visible up to currentReplayTime
  const visibleIncidents = incidents.filter((inc) => {
    const incTime = new Date(inc.reported_at).getTime();
    return incTime >= startTime && incTime <= currentReplayTime;
  });

  useEffect(() => {
    onFilterReplayIncidents(visibleIncidents);
  }, [progress, timeWindow]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 1 * playbackSpeed);
        });
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => {
    tacticalAudio.playClick();
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    tacticalAudio.playClick();
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <aside className="intel-slide-panel" aria-label="Incident Replay Mode" style={{ width: '420px' }}>
      <div className="panel-header">
        <div className="panel-header-title">
          <Clock size={16} color="#d4af37" />
          <span>EVENT REPLAY &bull; TEMPORAL PROGRESSION</span>
        </div>
        <button
          className="panel-close-btn"
          onClick={() => {
            onFilterReplayIncidents(incidents); // Reset back to all
            onClose();
          }}
          title="Exit Replay"
        >
          <X size={16} />
        </button>
      </div>

      <div className="panel-body">
        {/* Preset Window Selection */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
            HISTORICAL WINDOW
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {(['15M', '1H', '6H', '24H'] as const).map((win) => (
              <button
                key={win}
                className={`tactical-pill-btn ${timeWindow === win ? 'active gold' : ''}`}
                style={{ justifyContent: 'center', fontSize: '10px', padding: '6px' }}
                onClick={() => {
                  tacticalAudio.playClick();
                  setTimeWindow(win);
                  setProgress(100);
                  setIsPlaying(false);
                }}
              >
                {win === '15M' ? 'LAST 15M' : win === '1H' ? 'LAST 1H' : win === '6H' ? 'LAST 6H' : 'LAST 24H'}
              </button>
            ))}
          </div>
        </div>

        {/* Current Replay Timestamp Banner */}
        <div
          style={{
            padding: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '4px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>REPLAY TIMELINE CURSOR</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#d4af37', fontFamily: 'var(--font-mono)' }}>
                {new Date(currentReplayTime).toLocaleTimeString('en-GB', { hour12: false })} ICT
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>INCIDENTS AT THIS TIME</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#00f0ff' }}>{visibleIncidents.length}</div>
            </div>
          </div>

          {/* Slider */}
          <div style={{ marginTop: '10px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                setProgress(Number(e.target.value));
              }}
              style={{ width: '100%', accentColor: '#d4af37', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`tactical-pill-btn ${isPlaying ? 'gold active' : 'cyan'}`}
            style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
          </button>

          <button
            className="tactical-pill-btn"
            style={{ padding: '8px 12px' }}
            onClick={handleReset}
            title="Reset to Start"
          >
            <RotateCcw size={14} />
          </button>

          <button
            className="tactical-pill-btn"
            style={{ padding: '8px 10px', fontSize: '10px' }}
            onClick={() => {
              const speeds = [1, 2, 5];
              const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIndex]);
            }}
          >
            <FastForward size={12} />
            <span>{playbackSpeed}X</span>
          </button>
        </div>

        {/* List of Incidents matching current replay point */}
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#8b949e', marginBottom: '8px' }}>
          CHRONOLOGICAL DISPATCHES IN VIEW ({visibleIncidents.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto' }}>
          {visibleIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                tacticalAudio.playRadarBlip();
                onSelectIncident(inc);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#f0f6fc', fontWeight: '600' }}>{inc.title}</div>
                <div style={{ fontSize: '9px', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                  {new Date(inc.reported_at).toLocaleTimeString('en-GB', { hour12: false })} ICT &bull; {inc.severity}
                </div>
              </div>
              <span className={`severity-badge ${inc.severity.toLowerCase()}`} style={{ fontSize: '9px' }}>
                {inc.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
