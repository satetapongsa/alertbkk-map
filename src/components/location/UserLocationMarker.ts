import * as maplibregl from 'maplibre-gl';
import { UserLocationData } from '@/types/intelligence';

export class TacticalUserLocationMarker {
  private marker: maplibregl.Marker | null = null;
  private containerEl: HTMLDivElement;
  private labelEl: HTMLDivElement;
  private pulseEl: HTMLDivElement;
  private coreEl: HTMLDivElement;

  constructor(onClick?: () => void) {
    // 1. Root Element
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'tactical-user-marker';
    this.containerEl.id = 'tactical-user-unit';

    // 2. Marker Center Wrap
    const wrap = document.createElement('div');
    wrap.className = 'user-marker-container';

    // 3. Subtle pulse ring
    this.pulseEl = document.createElement('div');
    this.pulseEl.className = 'user-marker-pulse';
    wrap.appendChild(this.pulseEl);

    // 4. Tactical Cyan Core & Center Dot
    this.coreEl = document.createElement('div');
    this.coreEl.className = 'user-marker-core';
    const dot = document.createElement('div');
    dot.className = 'user-marker-center-dot';
    this.coreEl.appendChild(dot);
    wrap.appendChild(this.coreEl);

    // 5. Tactical Marker Label
    this.labelEl = document.createElement('div');
    this.labelEl.className = 'user-marker-label';
    this.labelEl.innerHTML = '<span>CURRENT USER LOCATION</span>';

    this.containerEl.appendChild(wrap);
    this.containerEl.appendChild(this.labelEl);

    if (onClick) {
      this.containerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
    }
  }

  public addToMap(map: maplibregl.Map, initialLoc: UserLocationData): maplibregl.Marker {
    if (this.marker) {
      this.marker.remove();
    }

    this.marker = new maplibregl.Marker({ element: this.containerEl })
      .setLngLat([initialLoc.longitude, initialLoc.latitude])
      .addTo(map);

    this.updateData(initialLoc);
    return this.marker;
  }

  public updateData(loc: UserLocationData) {
    if (this.marker) {
      this.marker.setLngLat([loc.longitude, loc.latitude]);
    }

    const accRound = Math.round(loc.accuracy);
    this.labelEl.innerHTML = `<span>USER [±${accRound}m]</span>`;
  }

  public remove() {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  public getMarker(): maplibregl.Marker | null {
    return this.marker;
  }
}
