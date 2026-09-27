import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

export function StatusBadge({ status, isOfflineFallback = false }) {
  const normalized = (status || 'UNCERTAIN').toUpperCase();

  if (normalized === 'BUGGY') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-950/30">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        <span>BUGGY — Issues Detected</span>
        {isOfflineFallback && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            Local Static
          </span>
        )}
      </div>
    );
  }

  if (normalized === 'CORRECT') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>CORRECT — No Obvious Errors Detected</span>
        {isOfflineFallback && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Local Static
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-950/30">
      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
      <span>UNCERTAIN — Needs Verification</span>
      {isOfflineFallback && (
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
          Local Static
        </span>
      )}
    </div>
  );
}

export function LineVerifiedBadge({ verified, line }) {
  if (line === null || line === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
        General Issue
      </span>
    );
  }

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" title="Verified against submitted source line">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        Line {line} (Verified)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30" title="AI suspected line — verify context">
      <ShieldAlert className="w-3 h-3 text-amber-400" />
      Line {line} (AI Suspected)
    </span>
  );
}
