import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function OllamaSetupModal({ isOpen, onClose, ollamaStatus, onRefreshStatus }) {
  const [activeOsTab, setActiveOsTab] = useState('windows');
  const [copiedCmd, setCopiedCmd] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setIsRefreshing(false);
  };

  const setupCommands = {
    windows: {
      install: 'winget install Ollama.Ollama',
      run: 'ollama run llama3.2',
      coder: 'ollama pull qwen2.5-coder:7b'
    },
    macos: {
      install: 'brew install ollama',
      run: 'ollama run llama3.2',
      coder: 'ollama pull qwen2.5-coder:7b'
    },
    linux: {
      install: 'curl -fsSL https://ollama.com/install.sh | sh',
      run: 'ollama run llama3.2',
      coder: 'ollama pull qwen2.5-coder:7b'
    },
    docker: {
      install: 'docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
      run: 'docker exec -it ollama ollama run llama3.2',
      coder: 'docker exec -it ollama ollama pull qwen2.5-coder:7b'
    }
  };

  const current = setupCommands[activeOsTab];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ollama-setup-title"
    >
      <div className="glass-panel w-full max-w-2xl p-6 border-slate-700 max-h-[90vh] overflow-y-auto flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 id="ollama-setup-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Local Ollama LLM Configuration</span>
                {ollamaStatus?.online ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Online ({ollamaStatus.models?.length || 0} models)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Smart Fallback Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Strict local-only execution at <code>http://localhost:11434</code> with zero external APIs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            aria-label="Close setup guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          ollamaStatus?.online
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {ollamaStatus?.online ? '✓ Ollama Runtime Connected' : '⚡ Smart Offline Engine Running'}
            </div>
            <p className="text-xs mt-1 text-slate-300">
              {ollamaStatus?.online
                ? `Using local model: ${ollamaStatus.configuredModel || 'llama3.2'}. Zero cloud token costs or data transmission.`
                : 'Ollama not detected on port 11434. CodeLens is currently using the smart built-in heuristic engine so all features work seamlessly.'}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        {/* Setup Instructions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="label-text flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-sky-400" /> Platform Setup Guide
            </span>
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              {['windows', 'macos', 'linux', 'docker'].map(os => (
                <button
                  key={os}
                  onClick={() => setActiveOsTab(os)}
                  className={`text-[11px] font-bold px-2 py-1 rounded capitalize transition-all ${
                    activeOsTab === os
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            
            {/* Step 1: Install */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>1. Install Ollama</span>
                <button
                  onClick={() => handleCopy(current.install, 'install')}
                  className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedCmd === 'install' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'install' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
                <code>{current.install}</code>
              </pre>
            </div>

            {/* Step 2: Run Model */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>2. Pull & Run Recommended Model (Llama 3.2)</span>
                <button
                  onClick={() => handleCopy(current.run, 'run')}
                  className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedCmd === 'run' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'run' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
                <code>{current.run}</code>
              </pre>
            </div>

            {/* Step 3: Coding Specialist Model */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>3. (Optional) Pull Specialized Coding Model (Qwen 2.5 Coder)</span>
                <button
                  onClick={() => handleCopy(current.coder, 'coder')}
                  className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedCmd === 'coder' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'coder' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
                <code>{current.coder}</code>
              </pre>
            </div>

          </div>
        </div>

        {/* Installed Models list if online */}
        {ollamaStatus?.online && ollamaStatus.models?.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <span className="label-text block mb-2">Installed Local Models on System:</span>
            <div className="flex flex-wrap gap-2">
              {ollamaStatus.models.map((m, i) => (
                <div key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 flex items-center gap-2">
                  <span className="text-sky-400 font-bold">{m.name}</span>
                  <span className="text-[10px] text-slate-400">{m.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
