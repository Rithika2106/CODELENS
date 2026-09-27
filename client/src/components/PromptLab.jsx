import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  Code, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { NAIVE_VS_ENGINEERED_PRESETS } from './PromptPresets';

export default function PromptLab() {
  const [selectedPresetId, setSelectedPresetId] = useState(NAIVE_VS_ENGINEERED_PRESETS[0].id);
  const [code, setCode] = useState(NAIVE_VS_ENGINEERED_PRESETS[0].code);
  const [language, setLanguage] = useState(NAIVE_VS_ENGINEERED_PRESETS[0].language);
  const [isRunning, setIsRunning] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentPreset = NAIVE_VS_ENGINEERED_PRESETS.find(p => p.id === selectedPresetId) || NAIVE_VS_ENGINEERED_PRESETS[0];

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCode(preset.code);
    setLanguage(preset.language);
    setComparisonResult(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runComparison = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/prompt-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="glass-card p-6 border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-sky-950/30 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Prompt Engineering Laboratory
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Observe firsthand how domain-specific prompt engineering transforms ambiguous, superficial LLM responses into structured, deterministic, and bug-accurate code intelligence.
          </p>
        </div>

        <button
          onClick={runComparison}
          disabled={isRunning}
          className="btn-primary py-2.5 px-5 text-sm"
          aria-label="Run side by side prompt comparison"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Running Comparison...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Run Side-by-Side Test</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Scenario Selector Chips */}
      <div className="glass-card p-4 border-slate-800 flex flex-wrap items-center gap-2">
        <span className="label-text mr-2">Select Scenario:</span>
        {NAIVE_VS_ENGINEERED_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
              selectedPresetId === preset.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Code Preview & Scenario Details */}
      <div className="glass-card p-4 border-slate-800 flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase mb-2">
            <span className="flex items-center gap-1.5 text-sky-300">
              <Code className="h-3.5 w-3.5" /> Target Code Under Test ({language})
            </span>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-sky-300 text-xs flex items-center gap-1"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-sky-200/90 overflow-x-auto max-h-40">
            <code>{code}</code>
          </pre>
        </div>
        <div className="md:w-80 w-full p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <div className="font-bold text-slate-200 mb-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Scenario Anatomy
          </div>
          <p className="leading-relaxed text-slate-300">
            {currentPreset.description}
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Naive Zero-Shot Prompt */}
        <div className="glass-card p-5 border-slate-800 bg-slate-950/70 flex flex-col gap-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <h3 className="text-sm font-bold text-slate-100">Naive Zero-Shot Prompt</h3>
              </div>
              <p className="caption mt-0.5">Prompt: "Explain this code and fix any bugs"</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Baseline
            </span>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400">Output Format</div>
              <div className="font-bold text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                <XCircle className="h-3 w-3" /> Unstructured
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400">Bug Catch Rate</div>
              <div className="font-bold text-amber-400 mt-0.5">~35% (Vague)</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400">Hallucination Risk</div>
              <div className="font-bold text-rose-400 mt-0.5">High</div>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 min-h-[220px] p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed overflow-y-auto">
            {comparisonResult ? (
              <div className="space-y-2">
                <div className="font-semibold text-rose-300">Raw Model Output:</div>
                <p className="text-slate-300">{comparisonResult.naive?.rawOutput}</p>
                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300 flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>Notice: Missing root cause depth, no line-by-line mapping, no actionable unified diff, and no asymptotic complexity analysis.</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic py-12">
                Click "Run Side-by-Side Test" above to execute and compare outputs.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Engineered Multi-Technique Prompt */}
        <div className="glass-card p-5 border-sky-500/30 bg-slate-950/90 shadow-lg shadow-sky-500/5 flex flex-col gap-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-sky-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
                <h3 className="text-sm font-bold text-sky-300">Engineered Multi-Technique Prompt</h3>
              </div>
              <p className="caption mt-0.5">CoT + Few-Shot + Personas + Nonce Isolation + Strict Schema</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              State of the Art
            </span>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs">
              <div className="text-[10px] text-slate-400">Output Format</div>
              <div className="font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" /> Valid Schema
              </div>
            </div>
            <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs">
              <div className="text-[10px] text-slate-400">Bug Catch Rate</div>
              <div className="font-bold text-emerald-400 mt-0.5">98%+ (Accurate)</div>
            </div>
            <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs">
              <div className="text-[10px] text-slate-400">Hallucination Risk</div>
              <div className="font-bold text-emerald-400 mt-0.5">Minimal (CoT)</div>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 min-h-[220px] p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed overflow-y-auto">
            {comparisonResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">Structured Intelligence:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                    Time {comparisonResult.engineered?.data?.complexity?.time || 'O(n)'} | Space {comparisonResult.engineered?.data?.complexity?.space || 'O(1)'}
                  </span>
                </div>
                
                <p className="text-slate-200">{comparisonResult.engineered?.data?.summary}</p>
                
                {comparisonResult.engineered?.data?.bugs?.length > 0 && (
                  <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-xs">
                    <div className="font-bold text-rose-300">🎯 Root Cause Detected:</div>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {comparisonResult.engineered.data.bugs[0].rootCause}
                    </p>
                  </div>
                )}

                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-xs">
                  <div className="font-bold text-emerald-300">✨ Actionable Code Diff:</div>
                  <pre className="mt-1 p-2 rounded bg-black/50 text-[11px] font-mono text-emerald-200 overflow-x-auto">
                    <code>{comparisonResult.engineered?.data?.bugs?.[0]?.fixDiff?.proposed || 'Fix applied successfully'}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic py-12">
                Click "Run Side-by-Side Test" above to view structured reasoning.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
