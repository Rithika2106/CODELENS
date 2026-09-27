import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Trash2, 
  Check, 
  X, 
  Cpu 
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  cacheStats,
  onClearCache
}) {
  const [privacyRedact, setPrivacyRedact] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="glass-panel w-full max-w-lg p-6 border-slate-700 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-400" />
            <h3 id="settings-dialog-title" className="text-base font-bold text-white">System Settings & Privacy</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            aria-label="Close settings dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* Section 1: Local-Only Privacy Policy */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Strict Zero-Cloud Local Privacy Policy</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              CodeLens runs exclusively on your local machine using Ollama. No source code, prompts, or conversation history are ever transmitted to any third-party or paid cloud API.
            </p>
          </div>

          {/* Section 2: Privacy & Guardrails */}
          <div>
            <span className="label-text block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Local Privacy Guardrails</span>
            </span>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <div>
                <label htmlFor="privacy-redact-checkbox" className="font-semibold text-slate-200 block cursor-pointer">
                  Auto-Redact Credentials
                </label>
                <div className="caption">Scans code for API keys, tokens, and passwords before prompt processing.</div>
              </div>
              <input
                id="privacy-redact-checkbox"
                type="checkbox"
                checked={privacyRedact}
                onChange={(e) => setPrivacyRedact(e.target.checked)}
                className="h-5 w-5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Cache Controls */}
          {cacheStats && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="label-text flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>LRU Response Cache</span>
                </span>
                <span className="font-mono text-xs text-slate-400">{cacheStats.size} items cached</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <div className="space-y-0.5">
                  <div>Hit Rate: <strong className="text-emerald-400">{cacheStats.hitRate}</strong></div>
                  <div className="caption">Hits: {cacheStats.hits} | Misses: {cacheStats.misses}</div>
                </div>
                <button
                  type="button"
                  onClick={onClearCache}
                  className="btn-outline text-xs py-1.5 px-3 text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full py-2.5 text-xs font-bold mt-2"
          >
            <span>Close</span>
          </button>

        </div>

      </div>
    </div>
  );
}
