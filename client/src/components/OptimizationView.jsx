import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  HardDrive, 
  Wrench, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  Code
} from 'lucide-react';

export default function OptimizationView({
  data,
  meta,
  onApplyOptimization
}) {
  const [copiedFull, setCopiedFull] = useState(false);
  const [diffMode, setDiffMode] = useState('split'); // 'split' | 'inline'

  if (!data) return null;

  const {
    summary = 'Optimization analysis complete.',
    improvements = [],
    optimizedFullCode = '',
    diff = { before: '', after: '', rationale: '' },
    complexityComparison = {
      before: { time: 'O(n)', space: 'O(1)' },
      after: { time: 'O(n)', space: 'O(1)' },
      details: 'Optimized control flow.'
    }
  } = data;

  const handleCopyFull = () => {
    if (!optimizedFullCode) return;
    navigator.clipboard.writeText(optimizedFullCode);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Executive Summary Card */}
      <div className="glass-card p-4 sm:p-5 border-l-4 border-amber-500 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Optimization & Refactoring Summary
            </h3>
          </div>

          {optimizedFullCode && (
            <button
              onClick={() => onApplyOptimization(optimizedFullCode)}
              className="btn-primary text-xs py-1 px-3 min-h-[34px] bg-gradient-to-r from-amber-500 to-teal-600 shadow-amber-500/20"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Apply Optimization to Editor</span>
            </button>
          )}
        </div>
        <p className="body-text text-slate-100">
          {summary}
        </p>
      </div>

      {/* Complexity Comparison Card (Before vs After) */}
      <div className="glass-card p-4 border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
          <span>Big-O Complexity Comparison</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Before */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Original Baseline</div>
              <div className="text-sm font-extrabold text-rose-300 font-mono mt-0.5">
                Time {complexityComparison.before?.time || 'O(n)'} · Space {complexityComparison.before?.space || 'O(1)'}
              </div>
            </div>
          </div>

          {/* After */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Optimized Gain</div>
              <div className="text-sm font-extrabold text-emerald-300 font-mono mt-0.5">
                Time {complexityComparison.after?.time || 'O(n)'} · Space {complexityComparison.after?.space || 'O(1)'}
              </div>
            </div>
          </div>

        </div>

        {complexityComparison.details && (
          <p className="caption mt-2.5 text-slate-300">
            {complexityComparison.details}
          </p>
        )}
      </div>

      {/* Key Improvements List */}
      {improvements && improvements.length > 0 && (
        <div className="glass-card p-4 border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Targeted Optimization Pillars
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {improvements.map((imp, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <div className="font-bold text-sky-300 mb-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{imp.area}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{imp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Diff Comparison */}
      {diff && (diff.before || diff.after) && (
        <div className="glass-card p-4 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-sky-400" />
              <span>Core Refactoring Diff</span>
            </h4>
            {diff.rationale && (
              <span className="caption text-sky-400 truncate max-w-xs">{diff.rationale}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono rounded-lg overflow-hidden border border-slate-800">
            {/* Before */}
            <div className="p-3 bg-rose-950/20 border-r border-slate-800 text-rose-200">
              <div className="text-[10px] font-bold uppercase text-rose-400 mb-1">Original Pattern</div>
              <pre className="overflow-x-auto whitespace-pre-wrap">{diff.before}</pre>
            </div>

            {/* After */}
            <div className="p-3 bg-emerald-950/20 text-emerald-200">
              <div className="text-[10px] font-bold uppercase text-emerald-400 mb-1">Optimized Refactor</div>
              <pre className="overflow-x-auto whitespace-pre-wrap">{diff.after}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Full Optimized Source Code */}
      {optimizedFullCode && (
        <div className="glass-card p-4 border border-emerald-500/30 bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Complete Refactored Source</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFull}
                className="btn-secondary text-xs py-1 px-2.5 min-h-[34px] flex items-center gap-1"
              >
                {copiedFull ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedFull ? 'Copied' : 'Copy All Code'}</span>
              </button>
              <button
                onClick={() => onApplyOptimization(optimizedFullCode)}
                className="btn-primary text-xs py-1 px-2.5 min-h-[34px]"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Replace Editor Code</span>
              </button>
            </div>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-200/90 overflow-x-auto max-h-56">
            <code>{optimizedFullCode}</code>
          </pre>
        </div>
      )}

    </div>
  );
}
