'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { SafetyBanner } from '@/components/SafetyBanner';
import { PageNavigationTabs } from '@/components/PageNavigationTabs';
import { Incident } from '@/types';
import {
  Shield,
  Trash2,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  formatThaiRelativeTime,
  INCIDENT_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Moderation state
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Check existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('admin_authenticated');
      const hasCookie = document.cookie.includes('admin_auth_session=authenticated');
      if (stored === 'true' || hasCookie) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the admin passcode');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        setPasscode('');
      } else {
        setAuthError(data.error || 'Incorrect passcode provided');
      }
    } catch {
      setAuthError('Authentication service error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPasscode('');
    setIncidents([]);
  };

  const handleResolve = async (incidentId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESOLVE', incidentId, adminName: 'Admin Moderator' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Incident ${incidentId} marked as resolved`);
        loadData();
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (incidentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this incident report?')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', incidentId, adminName: 'Admin Moderator' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Incident ${incidentId} deleted successfully`);
        loadData();
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.locationName.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SafetyBanner />

      {/* Screen 1: Passcode Login Modal / Gate */}
      {isAuthenticated === false && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500"></div>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-lg shadow-rose-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Operations Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Incident moderation and verification gateway. Enter authorized access credentials.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Admin Passcode</span>
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter security key..."
                    autoFocus
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/60 font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !passcode.trim()}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span>{isVerifying ? 'Authenticating...' : 'Unlock Command Portal'}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer select-none"
              >
                ← Return to Live Map
              </a>
            </div>
          </div>
        </main>
      )}

      {/* Screen 2: Authenticated Moderation Portal */}
      {isAuthenticated === true && (
        <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 space-y-5 flex-1">
          {/* Universal Page Switcher Navigation Tabs */}
          <PageNavigationTabs />

          {/* Header Hero */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Incident Moderation & Verification Portal
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Audit crowdsourced citizen reports, manage verification states, and resolve hazards
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer select-none"
              >
                <span>← Back to Map</span>
              </a>

              <button
                onClick={loadData}
                disabled={loading}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Action Toast */}
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search incident ID, title, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {filtered.length} of {incidents.length} records
            </div>
          </div>

          {/* Incidents Moderation Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Category & ID</th>
                    <th className="p-3.5">Title & Location</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verifications</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((inc) => {
                    const cfg = INCIDENT_CONFIG[inc.type] || INCIDENT_CONFIG.GENERAL;
                    const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.MEDIUM;
                    const stat = STATUS_CONFIG[inc.status] || STATUS_CONFIG.ACTIVE;

                    return (
                      <tr key={inc.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5 font-mono">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>{cfg.icon}</span>
                            <span className="text-slate-300">{cfg.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{inc.id}</span>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <p className="font-bold text-white truncate">{inc.title}</p>
                          <p className="text-[11px] text-cyan-400 truncate">{inc.locationName}</p>
                          <span className="text-[10px] text-slate-500">
                            {formatThaiRelativeTime(inc.createdAt)}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sev.bg} ${sev.border} ${sev.color}`}>
                            {sev.label}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${stat.badge}`}>
                            {stat.label}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-emerald-400 font-bold">👍 {inc.confirmCount}</span>
                          {inc.disputeCount > 0 && (
                            <span className="text-red-400 font-bold ml-2">👎 {inc.disputeCount}</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inc.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleResolve(inc.id)}
                                title="Mark incident as resolved"
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                              >
                                Resolve
                              </button>
                            )}
                            <Link
                              href={`/incident/${inc.id}`}
                              title="View details"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(inc.id)}
                              title="Delete report"
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Moderation Activity Audit Logs</span>
            </h3>

            <div className="space-y-2 pt-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-purple-300">{log.adminName}</span>
                    <span className="text-slate-400 ml-2">[{log.action}]</span>
                    <span className="text-slate-300 ml-2">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatThaiRelativeTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
