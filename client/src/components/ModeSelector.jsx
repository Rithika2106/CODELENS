import React from 'react';
import { Bug, BookOpen, Zap } from 'lucide-react';

export function ModeSelector({ currentMode, onSelectMode }) {
  const modes = [
    {
      id: 'debug',
      label: 'Debug',
      icon: Bug,
      tagline: 'Detect, diagnose & fix bugs',
      color: 'rose'
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: BookOpen,
      tagline: 'Understand code step-by-step',
      color: 'indigo'
    },
    {
      id: 'optimize',
      label: 'Optimize',
      icon: Zap,
      tagline: 'Enhance complexity & style',
      color: 'cyan'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all relative overflow-hidden ${
              isActive
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/80 ring-1 ring-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                isActive
                  ? mode.color === 'rose'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : mode.color === 'indigo'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{mode.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-slate-400 font-normal">
                {mode.tagline}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
