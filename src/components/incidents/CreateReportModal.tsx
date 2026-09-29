'use client';

import React, { useState } from 'react';
import {
  IncidentType,
  Severity,
  FloodDetails,
  TrafficDetails,
  TransitDetails,
} from '@/types';
import { INCIDENT_CONFIG, SEVERITY_CONFIG } from '@/lib/utils';
import {
  X,
  MapPin,
  Upload,
  AlertTriangle,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Sparkles,
  Droplets,
  Car,
} from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newIncident: any) => void;
  currentMapCoords?: { lat: number; lng: number } | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  currentMapCoords,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [type, setType] = useState<IncidentType>('FLOOD');
  const [latitude, setLatitude] = useState<number>(currentMapCoords?.lat || 13.7563);
  const [longitude, setLongitude] = useState<number>(currentMapCoords?.lng || 100.5018);
  const [locationName, setLocationName] = useState('Ratchadaphisek Road');
  const [district, setDistrict] = useState('Chatuchak');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [reporterName, setReporterName] = useState('Citizen Reporter');
  const [images, setImages] = useState<{ url: string; caption?: string }[]>([]);

  // Category specifics
  const [floodDetails, setFloodDetails] = useState<FloodDetails>({
    waterLevelCategory: '30-50cm',
    waterLevelCm: 35,
    smallCarPassable: false,
    largeTruckPassable: true,
    roadBlocked: false,
    strongCurrent: false,
    electricRisk: false,
  });

  const [trafficDetails, setTrafficDetails] = useState<TrafficDetails>({
    speedKmh: 15,
    queueLengthKm: 2.5,
    cause: 'Heavy rush hour volume',
    direction: 'Inbound toward main intersection',
    trafficLevel: 'HEAVY',
  });

  const [transitDetails, setTransitDetails] = useState<TransitDetails>({
    lineId: 'bts-sukhumvit',
    lineName: 'BTS Sukhumvit Line',
    lineColor: '#22c55e',
    stationName: 'Asok',
    delayMinutes: 10,
    status: 'DELAYED',
  });

  if (!isOpen) return null;

  // Use GPS location handler
  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setLocationName('Current GPS Coordinates');
        },
        () => {
          setErrorMessage('Unable to retrieve GPS position. Please enter location name manually.');
        }
      );
    }
  };

  const handleAddSampleImage = (imgUrl: string, caption: string) => {
    setImages((prev) => [...prev, { url: imgUrl, caption }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [
            ...prev,
            { url: reader.result as string, caption: files[0].name },
          ]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title for the incident');
      setStep(3);
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage('Please provide the location or road name');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: any = {
        type,
        title,
        description: description || `Reported ${INCIDENT_CONFIG[type]?.label} at ${locationName}`,
        latitude,
        longitude,
        locationName,
        district: district || 'Bangkok',
        province: 'Bangkok',
        severity,
        createdByName: reporterName || 'Citizen Reporter',
        images,
      };

      if (type === 'FLOOD') payload.floodDetails = floodDetails;
      if (type === 'TRAFFIC') payload.trafficDetails = trafficDetails;
      if (type === 'TRANSIT') payload.transitDetails = transitDetails;

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }

      onSubmitSuccess(data.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred submitting the report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
              {step}/5
            </span>
            <div>
              <h2 className="font-bold text-base text-slate-100">
                {step === 1 && 'Step 1: Incident Category'}
                {step === 2 && 'Step 2: Location & Coordinates'}
                {step === 3 && 'Step 3: Details & Severity'}
                {step === 4 && 'Step 4: Media Attachments'}
                {step === 5 && 'Step 5: Review & Publish'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Crowdsourced intelligence for Bangkok commuters and safety responders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body - Step contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(
                [
                  'FLOOD',
                  'TRAFFIC',
                  'ACCIDENT',
                  'ROAD_CLOSED',
                  'TRANSIT',
                  'EMERGENCY',
                  'GENERAL',
                ] as IncidentType[]
              ).map((catKey) => {
                const cfg = INCIDENT_CONFIG[catKey];
                const isSelected = type === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setType(catKey);
                      if (!title) {
                        if (catKey === 'FLOOD') setTitle('Waterlogged Roadway Alert');
                        if (catKey === 'TRAFFIC') setTitle('Severe Congestion & Slow Movement');
                        if (catKey === 'ACCIDENT') setTitle('Traffic Collision Blocking Lanes');
                        if (catKey === 'ROAD_CLOSED') setTitle('Roadway Closed to Traffic');
                        if (catKey === 'TRANSIT') setTitle('Train Signal Fault or Station Delay');
                        if (catKey === 'EMERGENCY') setTitle('Urgent Public Safety Emergency');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 scale-[1.02]'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center p-1.5"
                      dangerouslySetInnerHTML={{ __html: cfg.icon.replace(/width="16" height="16"/g, 'width="22" height="22"') }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{cfg.label}</h4>
                      <p className="text-[11px] text-slate-400">
                        {catKey === 'FLOOD' && 'Deep water, flash floods, drain backup'}
                        {catKey === 'TRAFFIC' && 'Standstill traffic, queue tailbacks'}
                        {catKey === 'ACCIDENT' && 'Vehicle collision, overturned vehicles'}
                        {catKey === 'ROAD_CLOSED' && 'Repairs, fallen tree, roadblocks'}
                        {catKey === 'TRANSIT' && 'BTS, MRT, Airport Link disruptions'}
                        {catKey === 'EMERGENCY' && 'Fire, hazard, rescue dispatch'}
                        {catKey === 'GENERAL' && 'General advisory notices'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: LOCATION PICKER */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Use My Current Device GPS</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Landmark / Road Name *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Ratchadaphisek Rd near Criminal Court, Asok Intersection"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chatuchak, Watthana, Bang Rak"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    defaultValue="Bangkok"
                    disabled
                    className="w-full px-3.5 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-slate-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between font-mono">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  (Bangkok Metro Grid)
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS & SEVERITY */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. High water level on left lanes, sedans avoid"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Severity[]).map((sevKey) => {
                    const sc = SEVERITY_CONFIG[sevKey];
                    const isSel = severity === sevKey;
                    return (
                      <button
                        key={sevKey}
                        type="button"
                        onClick={() => setSeverity(sevKey)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                          isSel
                            ? `${sc.bg} ${sc.border} ${sc.color} ring-2 ring-current`
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC FLOOD SECTION */}
              {type === 'FLOOD' && (
                <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-2xl p-3.5 space-y-3">
                  <h4 className="font-semibold text-xs text-cyan-300 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    Flood Parameters
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Water Depth</label>
                      <select
                        value={floodDetails.waterLevelCategory}
                        onChange={(e: any) =>
                          setFloodDetails({ ...floodDetails, waterLevelCategory: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                      >
                        <option value="<10cm">Below 10 cm</option>
                        <option value="10-30cm">10 - 30 cm</option>
                        <option value="30-50cm">30 - 50 cm</option>
                        <option value="50-100cm">50 - 100 cm</option>
                        <option value=">100cm">Above 100 cm</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="smallCar"
                        checked={floodDetails.smallCarPassable}
                        onChange={(e) =>
                          setFloodDetails({ ...floodDetails, smallCarPassable: e.target.checked })
                        }
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500 w-4 h-4"
                      />
                      <label htmlFor="smallCar" className="text-xs text-slate-300">
                        Sedans Passable
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="roadBlocked"
                        checked={floodDetails.roadBlocked}
                        onChange={(e) =>
                          setFloodDetails({ ...floodDetails, roadBlocked: e.target.checked })
                        }
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500 w-4 h-4"
                      />
                      <label htmlFor="roadBlocked" className="text-xs text-slate-300">
                        Road Blocked
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC TRAFFIC SECTION */}
              {type === 'TRAFFIC' && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3.5 space-y-3">
                  <h4 className="font-semibold text-xs text-amber-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-amber-400" />
                    Traffic Condition Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">
                        Est. Speed (km/h)
                      </label>
                      <input
                        type="number"
                        value={trafficDetails.speedKmh}
                        onChange={(e) =>
                          setTrafficDetails({ ...trafficDetails, speedKmh: Number(e.target.value) })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">
                        Tailback Queue (km)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={trafficDetails.queueLengthKm}
                        onChange={(e) =>
                          setTrafficDetails({ ...trafficDetails, queueLengthKm: Number(e.target.value) })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Additional Details & Guidelines
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide helpful context: which lanes are affected, emergency responders on scene, detour advice..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: PHOTO ATTACHMENT */}
          {step === 4 && (
            <div className="space-y-3.5">
              <div className="flex gap-2">
                <label className="flex-1 py-3 px-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  Or select realistic sample verification imagery:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSampleImage(
                        'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
                        'Flood on road'
                      )
                    }
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-xl text-left hover:border-cyan-400 transition-all cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80"
                      alt="Flood"
                      className="w-full h-14 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-slate-300 block mt-1 truncate">Flood</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSampleImage(
                        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
                        'Heavy traffic congestion'
                      )
                    }
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-xl text-left hover:border-amber-400 transition-all cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=300&q=80"
                      alt="Traffic"
                      className="w-full h-14 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-slate-300 block mt-1 truncate">Traffic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSampleImage(
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
                        'Road accident'
                      )
                    }
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-xl text-left hover:border-red-400 transition-all cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80"
                      alt="Accident"
                      className="w-full h-14 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-slate-300 block mt-1 truncate">Accident</span>
                  </button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    Attached Files ({images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-slate-700 group h-20"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-90 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-3.5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{INCIDENT_CONFIG[type]?.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
                    <p className="text-xs text-cyan-400">{locationName}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  {description || 'No additional description provided.'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>Type: <strong className="text-slate-200">{INCIDENT_CONFIG[type]?.label}</strong></div>
                  <div>Severity: <strong className="text-slate-200">{SEVERITY_CONFIG[severity]?.label}</strong></div>
                  <div>Reporter: <strong className="text-slate-200">{reporterName}</strong></div>
                  <div>Attachments: <strong className="text-slate-200">{images.length} images</strong></div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                Upon publishing, this event will instantly sync and broadcast in real-time to all live map viewers across Bangkok.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Publishing Incident...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Broadcast Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
