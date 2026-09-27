import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
  Wrench,
  Info,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { StatusBadge, LineVerifiedBadge } from './StatusBadge.jsx';

export function DebugInspector({ result, onApplyFixedCode, originalCode }) {
  const [copiedFix, setCopiedFix] = useState(false);

  if (!result) return null;

  const {
    status = 'UNCERTAIN',
    errors = [],
    fixed_code = '',
    explanation = '',
    learning_tip = '',
    meta = {}
  } = result;

  const isBuggy = status.toUpperCase() === 'BUGGY';
  const isCorrect = status.toUpperCase() === 'CORRECT';
  const isUncertain = status.toUpperCase() === 'UNCERTAIN';

  const handleCopyFix = async () => {
    if (!fixed_code) return;
    try {
      await navigator.clipboard.writeText(fixed_code);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    } catch (err) {
      console.error('Failed to copy fixed code:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <StatusBadge
            status={status}
            isOfflineFallback={meta?.isOfflineFallback}
          />
          {meta?.model && (
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 hidden sm:inline">
              Model: {meta.model}
            </span>
          )}
        </div>

        {meta?.totalDurationMs && (
          <span className="text-xs font-mono text-slate-500">
            Latency: {meta.totalDurationMs}ms
          </span>
        )}
      </div>

      {/* When Code is CORRECT */}
      {isCorrect && (
        <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-300">
                No obvious errors detected
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {explanation ||
                  'The static analysis and AI model verified this code snippet. Syntax, scoping, and standard execution patterns appear correct.'}
              </p>
            </div>
          </div>

          {learning_tip && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">
                  Best Practice Tip:{' '}
                </span>
                <span className="text-slate-400">{learning_tip}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When Code is BUGGY — Bug Cards */}
      {isBuggy && errors.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Detected Issues ({errors.length})</span>
          </h3>

          {errors.map((err, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl bg-slate-900 border border-slate-800/90 shadow-md overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/60 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {err.title || 'Code Defect'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <LineVerifiedBadge
                    verified={err.verified}
                    line={err.line}
                  />
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {err.severity || 'error'}
                  </span>
                </div>
              </div>

              {/* Code Snippet Highlight */}
              {err.snippet && (
                <div className="px-4 py-2.5 bg-rose-500/5 border-b border-rose-500/10 font-mono text-xs flex items-center gap-2 text-rose-200">
                  <span className="text-rose-400 font-bold select-none">
                    Line {err.line || '?'}:
                  </span>
                  <code className="bg-slate-950 px-2 py-0.5 rounded border border-rose-500/20 text-rose-300">
                    {err.snippet}
                  </code>
                </div>
              )}

              {/* Structured Diagnostics Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* What it was trying to do */}
                {err.what_it_is_trying_to_do && (
                  <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      Intended Behavior
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {err.what_it_is_trying_to_do}
                    </p>
                  </div>
                )}

                {/* Problem Found */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Problem Found
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {err.problem || 'Syntax or logical issue identified.'}
                  </p>
                </div>

                {/* Root Cause */}
                {err.root_cause && (
                  <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      Root Cause
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {err.root_cause}
                    </p>
                  </div>
                )}

                {/* What Happens at Runtime */}
                {err.what_happens && (
                  <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      What Happens
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {err.what_happens}
                    </p>
                  </div>
                )}
              </div>

              {/* Fix & Why it works */}
              <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
                {err.fix && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-emerald-300">
                        Suggested Fix
                      </span>
                    </div>
                    <p className="text-slate-200 font-mono bg-slate-950 p-2 rounded border border-emerald-500/20 text-[11px] mb-2">
                      {err.fix}
                    </p>
                    {err.why_fix_works && (
                      <p className="text-slate-400 text-xs leading-relaxed">
                        <strong className="text-emerald-400/90 font-medium">
                          Why this works:{' '}
                        </strong>
                        {err.why_fix_works}
                      </p>
                    )}
                  </div>
                )}

                {/* Prevention Tip */}
                {err.prevention_tip && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300 font-medium">
                        Prevention Tip:{' '}
                      </strong>
                      {err.prevention_tip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Corrected Code Section */}
      {isBuggy && fixed_code && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corrected Code</span>
            </h3>
            <div className="flex items-center gap-2">
              {onApplyFixedCode && (
                <button
                  type="button"
                  onClick={() => onApplyFixedCode(fixed_code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Apply Fix to Editor</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyFix}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all shadow-sm"
              >
                {copiedFix ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative rounded-lg bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs overflow-x-auto">
            <pre className="text-emerald-300 whitespace-pre">{fixed_code}</pre>
          </div>
        </div>
      )}

      {/* When Code is UNCERTAIN */}
      {isUncertain && (
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-sm flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-300">
                Analysis Finding is Uncertain
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {explanation ||
                  'The code could not be definitively confirmed as buggy or correct. This usually occurs when external context, libraries, or input contracts are unspecified.'}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <strong>Action:</strong> Review variables, import definitions, and function invocation sites in your full codebase.
          </div>
        </div>
      )}

      {/* Summary Explanation */}
      {isBuggy && explanation && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col gap-1.5">
          <span className="font-semibold text-slate-300">
            Diagnostic Summary
          </span>
          <p className="text-slate-400 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
