import React, { useState } from 'react';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Code 
} from 'lucide-react';

export default function DebugView({
  bugs = [],
  fixedFullCode = '',
  onApplyFix,
  onHoverLines
}) {
  const [copiedFixId, setCopiedFixId] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleCopyFix = (fixText, id) => {
    navigator.clipboard.writeText(fixText);
    setCopiedFixId(id);
    setTimeout(() => setCopiedFixId(null), 2000);
  };

  const handleCopyFullCode = () => {
    if (!fixedFullCode) return;
    navigator.clipboard.writeText(fixedFullCode);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  // If clean code with no bugs
  if (!bugs || bugs.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 border border-emerald-500/30 bg-emerald-950/20">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-emerald-300">Clean Execution — No Bugs Detected</h3>
          <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
            The local reasoning engine simulated control flow, state transitions, and common language pitfalls without encountering runtime errors or memory leaks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-rose-500/10 text-rose-400">
            <Bug className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
            Intelligent Bug Diagnostic ({bugs.length} Issue{bugs.length > 1 ? 's' : ''})
          </h3>
        </div>

        {fixedFullCode && (
          <button
            onClick={() => onApplyFix(fixedFullCode)}
            className="btn-primary text-xs py-1.5 px-3 min-h-[36px]"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Apply All Fixes to Editor</span>
          </button>
        )}
      </div>

      {/* Bugs List */}
      <div className="flex flex-col gap-4">
        {bugs.map((bug, index) => {
          const isCritical = bug.severity === 'critical';
          const isWarning = bug.severity === 'warning';

          return (
            <div
              key={bug.id || index}
              onMouseEnter={() => bug.line && onHoverLines && onHoverLines({ startLine: bug.line, endLine: bug.line })}
              onMouseLeave={() => onHoverLines && onHoverLines(null)}
              className="glass-card p-4 border border-rose-900/40 bg-slate-900/60 flex flex-col gap-3 transition-all hover:border-rose-700/60"
            >
              {/* Bug Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {bug.severity || 'Issue'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">
                    {bug.title}
                  </h4>
                </div>

                {bug.line && (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Target Line {bug.line}
                  </span>
                )}
              </div>

              {/* Root Cause Analysis */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="label-text mb-1 flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Why This Occurs (Root Cause):</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {bug.rootCause}
                </p>
              </div>

              {/* Code Fix Diff Viewer */}
              {bug.fixDiff && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Proposed Fix Diff:
                    </span>
                    <button
                      onClick={() => handleCopyFix(bug.fixDiff.proposed, bug.id || index)}
                      className="text-slate-400 hover:text-sky-300 transition-colors flex items-center gap-1 text-xs"
                      aria-label="Copy fixed snippet"
                    >
                      {copiedFixId === (bug.id || index) ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Fixed Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Diff Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono rounded-lg overflow-hidden border border-slate-800">
                    
                    {/* Before (Buggy) */}
                    <div className="p-3 bg-rose-950/20 border-r border-slate-800 text-rose-200">
                      <div className="text-[10px] font-bold uppercase text-rose-400 mb-1">Original (Buggy)</div>
                      <pre className="overflow-x-auto whitespace-pre-wrap">{bug.fixDiff.original}</pre>
                    </div>

                    {/* After (Fixed) */}
                    <div className="p-3 bg-emerald-950/20 text-emerald-200">
                      <div className="text-[10px] font-bold uppercase text-emerald-400 mb-1">Resolved (Fixed)</div>
                      <pre className="overflow-x-auto whitespace-pre-wrap">{bug.fixDiff.proposed}</pre>
                    </div>

                  </div>
                </div>
              )}

              {/* How it resolves */}
              {bug.explanation && (
                <div className="text-xs text-slate-300 flex items-start gap-2 pt-1 border-t border-slate-800/60">
                  <ArrowRight className="h-3.5 w-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Fix Mechanism:</strong> {bug.explanation}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Full Fixed Code Dropdown */}
      {fixedFullCode && (
        <div className="glass-card p-4 border border-emerald-500/30 bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>Full Corrected Source File</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFullCode}
                className="btn-secondary text-xs py-1 px-2.5 min-h-[34px] flex items-center gap-1"
                aria-label="Copy full corrected source code"
              >
                {copiedFull ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedFull ? 'Copied' : 'Copy All Code'}</span>
              </button>
              <button
                onClick={() => onApplyFix(fixedFullCode)}
                className="btn-primary text-xs py-1 px-2.5 min-h-[34px]"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Replace Editor Code</span>
              </button>
            </div>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-200/90 overflow-x-auto max-h-56">
            <code>{fixedFullCode}</code>
          </pre>
        </div>
      )}

    </div>
  );
}
