import React from 'react';
import { 
  Play, 
  Loader2, 
  BookOpen, 
  Wrench, 
  Zap, 
  MessageSquare, 
  GraduationCap, 
  Cpu, 
  Square
} from 'lucide-react';

export default function AnalysisControls({
  mode,
  setMode,
  level,
  setLevel,
  onAnalyze,
  isAnalyzing,
  onCancel,
  activeModel
}) {
  const modes = [
    { id: 'explain', label: 'Explain Logic', icon: BookOpen, desc: 'Section-by-section walkthrough, algorithmic approach, and complexity' },
    { id: 'debug', label: 'Debug & Diagnose', icon: Wrench, desc: 'Identify syntax, logic, security bugs with root cause & inline fixes' },
    { id: 'optimize', label: 'Optimize & Refactor', icon: Zap, desc: 'Algorithmic efficiency, readability, and side-by-side diff' },
    { id: 'chat', label: 'Follow-up Q&A', icon: MessageSquare, desc: 'Multi-turn conversational questions retaining code context' }
  ];

  const levels = [
    { id: 'eli5', label: 'ELI5', emoji: '🧸' },
    { id: 'beginner', label: 'Beginner', emoji: '🌱' },
    { id: 'intermediate', label: 'Intermediate', emoji: '⚡' },
    { id: 'expert', label: 'Senior / Staff', emoji: '🔬' }
  ];

  return (
    <div className="glass-panel p-4 sm:p-5 flex flex-col gap-4 shadow-lg border border-slate-800">
      
      {/* Top Row: Mode Toggle & Level Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Mode Selector Segmented Group */}
        <div className="flex flex-col gap-1">
          <span className="label-text">Analysis Mode</span>
          <div 
            role="group" 
            aria-label="Analysis Mode" 
            className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800"
          >
            {modes.map(m => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  aria-pressed={isActive}
                  title={m.desc}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selector (Hidden in Chat mode) */}
        {mode !== 'chat' && (
          <div className="flex flex-col gap-1">
            <span className="label-text flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-sky-400" /> Target Experience Level
            </span>
            <div 
              role="group" 
              aria-label="Experience Level" 
              className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800"
            >
              {levels.map(lvl => {
                const isActive = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                      isActive
                        ? 'bg-slate-800 text-sky-300 font-bold border border-sky-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="mr-1">{lvl.emoji}</span>
                    <span>{lvl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Row: Active Model Pill + Action Button / Stop Button */}
      {mode !== 'chat' && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-sky-400" />
            <span>Runtime Engine: <strong className="text-slate-200 font-mono">{activeModel || 'llama3.2 (Local)'}</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isAnalyzing ? (
              <button
                onClick={onCancel}
                className="btn-outline text-xs py-2 px-3 text-rose-300 border-rose-500/40 hover:bg-rose-500/10 min-h-[38px] flex items-center gap-1.5"
                title="Cancel generation"
              >
                <Square className="h-3.5 w-3.5 fill-rose-400" />
                <span>Stop Generating</span>
              </button>
            ) : null}

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="btn-primary min-w-[190px] text-xs font-bold min-h-[38px]"
              aria-label={isAnalyzing ? 'Analyzing code...' : `Run ${mode} analysis`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Processing Code...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                  <span>
                    {mode === 'explain' ? 'Explain Code' : mode === 'debug' ? 'Diagnose Bugs' : 'Optimize Code'}
                  </span>
                  <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-white/90">
                    Ctrl+↵
                  </kbd>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
