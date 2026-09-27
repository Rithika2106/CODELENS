import React from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Wrench,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export function BugTimeline({ status }) {
  const normalized = (status || 'UNCERTAIN').toUpperCase();

  let steps = [];

  if (normalized === 'BUGGY') {
    steps = [
      {
        id: 'scan',
        label: 'SCAN',
        desc: 'Static & Semantic checks',
        icon: Search,
        color: 'cyan'
      },
      {
        id: 'bug',
        label: 'BUG FOUND',
        desc: 'Root cause identified',
        icon: AlertTriangle,
        color: 'rose'
      },
      {
        id: 'why',
        label: 'WHY',
        desc: 'Runtime / Compiler mechanics',
        icon: HelpCircle,
        color: 'amber'
      },
      {
        id: 'fix',
        label: 'FIX',
        desc: 'Corrected working code',
        icon: Wrench,
        color: 'emerald'
      },
      {
        id: 'learn',
        label: 'LEARN',
        desc: 'Prevention takeaway',
        icon: Lightbulb,
        color: 'indigo'
      }
    ];
  } else if (normalized === 'CORRECT') {
    steps = [
      {
        id: 'scan',
        label: 'SCAN',
        desc: 'Static & Semantic checks',
        icon: Search,
        color: 'cyan'
      },
      {
        id: 'clean',
        label: 'NO BUG DETECTED',
        desc: 'Verified valid syntax & logic',
        icon: CheckCircle2,
        color: 'emerald'
      },
      {
        id: 'exec',
        label: 'HOW IT WORKS',
        desc: 'Program execution flow',
        icon: BookOpen,
        color: 'indigo'
      },
      {
        id: 'learn',
        label: 'BEST PRACTICES',
        desc: 'Idiomatic principles',
        icon: Lightbulb,
        color: 'cyan'
      }
    ];
  } else {
    // UNCERTAIN
    steps = [
      {
        id: 'scan',
        label: 'SCAN',
        desc: 'Static & Semantic checks',
        icon: Search,
        color: 'cyan'
      },
      {
        id: 'uncertain',
        label: 'UNCERTAIN',
        desc: 'Context dependent',
        icon: HelpCircle,
        color: 'amber'
      },
      {
        id: 'review',
        label: 'REVIEW',
        desc: 'Manual verification advised',
        icon: Lightbulb,
        color: 'indigo'
      }
    ];
  }

  const getColorClasses = (color) => {
    switch (color) {
      case 'rose':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-400';
      case 'emerald':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
      case 'amber':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
      case 'indigo':
        return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400';
      case 'cyan':
      default:
        return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400';
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const colorClass = getColorClasses(step.color);

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2.5 flex-1 min-w-[130px]">
                <div
                  className={`p-1.5 rounded-lg border shadow-sm ${colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {step.desc}
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block text-slate-700 mx-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
