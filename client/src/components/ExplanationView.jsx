import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  HardDrive, 
  Cpu, 
  Layers, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  ListOrdered,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

export default function ExplanationView({
  data,
  meta,
  result,
  onHoverLines,
  selectedLines
}) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const res = data || result || {};

  const summary = res.summary || res.purpose || res.explanation || 'No summary available.';
  const algorithmicApproach = res.algorithmicApproach || res.algorithm || '';
  const dataStructures = res.dataStructures || res.data_structures || [];
  const keyConcepts = res.keyConcepts || res.concepts || [];
  const breakdown = res.breakdown || res.step_by_step || [];
  const complexity = res.complexity || {
    time: res.time_complexity || 'O(n)',
    space: res.space_complexity || 'O(1)',
    bottlenecks: ''
  };
  const keyTakeaways = res.keyTakeaways || (res.learning_tip ? [res.learning_tip] : []);
  const detectedIssue = res.detected_issue || (res.status === 'BUGGY' ? 'Potential runtime issue detected' : null);
  const status = res.status || (detectedIssue ? 'BUGGY' : 'CORRECT');

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStepHover = (step) => {
    if (!onHoverLines) return;
    if (step && (step.startLine || step.lines)) {
      if (step.startLine && step.endLine) {
        onHoverLines([step.startLine, step.endLine]);
      } else if (typeof step.lines === 'string') {
        const match = step.lines.match(/\d+/g);
        if (match && match.length >= 2) {
          onHoverLines([parseInt(match[0], 10), parseInt(match[1], 10)]);
        } else if (match && match.length === 1) {
          onHoverLines([parseInt(match[0], 10), parseInt(match[0], 10)]);
        }
      }
    } else {
      onHoverLines(null);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner with Model & Complexity Status */}
      <div className="p-4 rounded-xl glass-panel flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={status} isOfflineFallback={meta?.isFallback || meta?.isOfflineFallback} />
          {algorithmicApproach && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
              Approach: {algorithmicApproach}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono">
          {complexity.time && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Time: <strong className="text-slate-200">{complexity.time}</strong></span>
            </div>
          )}
          {complexity.space && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Space: <strong className="text-slate-200">{complexity.space}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Warning alert if code has issues */}
      {detectedIssue && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-rose-200 font-semibold text-sm">Potential Problem Detected</strong>
            <p className="text-slate-300 leading-relaxed">{detectedIssue}</p>
            <p className="text-rose-400/90 text-[11px] font-mono">
              Switch to <strong>Debug & Diagnose</strong> mode for complete root-cause breakdown and 1-click patch.
            </p>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="glass-panel p-5 relative border border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Logic & Functional Purpose</span>
          </h3>
          <button
            onClick={handleCopySummary}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            title="Copy summary text"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Step-by-Step Logic Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
              <span>Step-by-Step Logic Flow</span>
            </h3>
            <span className="caption">Hover step to highlight code lines</span>
          </div>

          <div className="space-y-2.5">
            {breakdown.map((item, idx) => {
              const stepNumber = item.step || idx + 1;
              const title = item.title || (item.startLine ? `Lines ${item.startLine}-${item.endLine || item.startLine}` : `Step ${idx + 1}`);
              const desc = item.explanation || item.description || '';
              const codeSnippet = item.code || '';
              const lineBadge = item.startLine ? `L${item.startLine}-${item.endLine || item.startLine}` : (item.lines || null);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    setActiveStep(idx);
                    handleStepHover(item);
                  }}
                  onMouseLeave={() => {
                    setActiveStep(null);
                    handleStepHover(null);
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    activeStep === idx 
                      ? 'glass-panel border-sky-500/50 bg-sky-950/20 shadow-md' 
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold shrink-0">
                      {stepNumber}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{title}</h4>
                        {lineBadge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                            {lineBadge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>

                      {codeSnippet && (
                        <pre className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                          <code>{codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Concepts & Data Structures Chips */}
      {((keyConcepts && keyConcepts.length > 0) || (dataStructures && dataStructures.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyConcepts && keyConcepts.length > 0 && (
            <div className="glass-panel p-4 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Key Concepts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keyConcepts.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dataStructures && dataStructures.length > 0 && (
            <div className="glass-panel p-4 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Data Structures
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dataStructures.map((ds, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20"
                  >
                    {ds}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Takeaways & Best Practices */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="glass-panel p-4 border border-amber-500/20 bg-amber-950/10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Key Principles & Best Practices
          </span>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            {keyTakeaways.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
