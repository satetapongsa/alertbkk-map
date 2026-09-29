'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SafetyBanner } from '@/components/SafetyBanner';
import { PageNavigationTabs } from '@/components/PageNavigationTabs';
import { Incident } from '@/types';
import {
  formatThaiRelativeTime,
  INCIDENT_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageSquare,
  AlertTriangle,
  Send,
  Check,
} from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState<'CONFIRMED' | 'DISPUTED' | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadIncident() {
      try {
        const res = await fetch(`/api/incidents/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setIncident(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadIncident();
  }, [id]);

  const handleConfirm = async () => {
    if (!incident || hasVoted) return;
    try {
      const res = await fetch(`/api/incidents/${incident.id}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setIncident(data.data);
        setHasVoted('CONFIRMED');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispute = async () => {
    if (!incident || hasVoted) return;
    try {
      const res = await fetch(`/api/incidents/${incident.id}/dispute`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setIncident(data.data);
        setHasVoted('DISPUTED');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: commentAuthor.trim() || 'Citizen Responder',
          message: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIncident((prev) =>
          prev ? { ...prev, comments: [...prev.comments, data.data] } : null
        );
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <SafetyBanner />
        <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5 flex-1 flex flex-col items-center justify-center">
          <PageNavigationTabs />
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-400">Loading incident intelligence report...</p>
        </main>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <SafetyBanner />
        <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5 flex-1 flex flex-col items-center justify-center text-center">
          <PageNavigationTabs />
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
          <h2 className="text-lg font-bold">Incident Not Found</h2>
          <p className="text-xs text-slate-400 mb-4">
            This incident may have expired, been cleared by community moderation, or moved.
          </p>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-1.5 cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Map</span>
          </a>
        </main>
      </div>
    );
  }

  const cfg = INCIDENT_CONFIG[incident.type] || INCIDENT_CONFIG.GENERAL;
  const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.MEDIUM;
  const stat = STATUS_CONFIG[incident.status] || STATUS_CONFIG.ACTIVE;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SafetyBanner />

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 space-y-5 flex-1">
        {/* Universal Page Switcher Navigation Tabs */}
        <PageNavigationTabs />

        {/* Back Link & Share */}
        <div className="flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </a>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Incident'}</span>
          </button>
        </div>

        {/* Header Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-3xl">{cfg.icon}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.bgBadge}`}>
              {cfg.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sev.bg} ${sev.border} ${sev.color}`}>
              Severity: {sev.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stat.badge}`}>
              {stat.label}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {incident.title}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400 mt-2 flex-wrap">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{incident.locationName}</span>
              {incident.district && <span>• {incident.district}</span>}
              <span>• {incident.province}</span>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
            {incident.description}
          </p>

          {/* FLOOD Callout */}
          {incident.type === 'FLOOD' && incident.floodDetails && (
            <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-cyan-200">
              <div>
                <p className="text-slate-400 text-[11px]">Water Depth</p>
                <p className="font-bold text-white text-sm">
                  {incident.floodDetails.waterLevelCm ? `${incident.floodDetails.waterLevelCm} cm` : incident.floodDetails.waterLevelCategory}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Sedans</p>
                <p className={`font-bold ${incident.floodDetails.smallCarPassable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {incident.floodDetails.smallCarPassable ? 'Passable' : 'Do Not Enter'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Heavy Trucks</p>
                <p className="font-bold text-emerald-400">
                  {incident.floodDetails.largeTruckPassable ? 'Passable' : 'Caution'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Road Status</p>
                <p className="font-bold text-amber-300">
                  {incident.floodDetails.roadBlocked ? 'Road Blocked' : 'Partial Lanes Open'}
                </p>
              </div>
            </div>
          )}

          {/* Verification Bar & Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                👥 {incident.confirmCount} Citizen Verifications
              </span>
              {incident.disputeCount > 0 && (
                <span className="text-amber-400 font-medium">
                  ⚠️ {incident.disputeCount} Disputed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                disabled={hasVoted !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  hasVoted === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{hasVoted === 'CONFIRMED' ? 'Confirmed' : 'Still Active'}</span>
              </button>

              <button
                onClick={handleDispute}
                disabled={hasVoted !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  hasVoted === 'DISPUTED'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{hasVoted === 'DISPUTED' ? 'Recorded' : 'Cleared / Inaccurate'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        {incident.images && incident.images.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>📸 On-Site Photographic Evidence ({incident.images.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incident.images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption || 'Incident Image'} className="w-full h-56 object-cover" />
                  {img.caption && (
                    <p className="p-2 text-xs text-slate-400 bg-slate-950">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Incident Chronology & Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
            {incident.timeline && incident.timeline.length > 0 ? (
              incident.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-900"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">
                        {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.user && (
                        <span className="text-[11px] text-slate-400">• By {item.user}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No additional timeline entries recorded.</p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Community Field Reports & Comments ({incident.comments.length})</span>
          </h3>

          <div className="space-y-3">
            {incident.comments.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl border ${
                  c.isOfficial
                    ? 'bg-cyan-950/30 border-cyan-700/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-bold ${c.isOfficial ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {c.userName} {c.isOfficial && '⭐ (Verified Agency)'}
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">
                    {formatThaiRelativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{c.message}</p>
              </div>
            ))}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your name or callsign"
                className="w-1/3 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post an on-the-ground update..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
