import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Breadcrumbs from './components/Breadcrumbs';
import CodeEditor from './components/CodeEditor';
import AnalysisControls from './components/AnalysisControls';
import ExplanationView from './components/ExplanationView';
import DebugView from './components/DebugView';
import OptimizationView from './components/OptimizationView';
import FollowUpChat from './components/FollowUpChat';
import PromptLab from './components/PromptLab';
import TutorialView from './components/TutorialView';
import EvaluationDashboard from './components/EvaluationDashboard';
import FeedbackModal from './components/FeedbackModal';
import SettingsModal from './components/SettingsModal';
import StyleGuideModal from './components/StyleGuideModal';
import OllamaSetupModal from './components/OllamaSetupModal';
import HistoryDrawer from './components/HistoryDrawer';
import { SAMPLE_SNIPPETS } from './components/SampleSnippets';
import { 
  Sparkles, 
  AlertCircle, 
  Code2,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('codelens_theme') || 'dark');

  // Navigation & Modal states
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'prompt-lab' | 'tutorial' | 'benchmark'
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);
  const [isOllamaSetupOpen, setIsOllamaSetupOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Studio Code & Controls state
  const [code, setCode] = useState(SAMPLE_SNIPPETS[0].code);
  const [language, setLanguage] = useState(SAMPLE_SNIPPETS[0].language);
  const [mode, setMode] = useState('explain'); // 'explain' | 'debug' | 'optimize' | 'chat'
  const [level, setLevel] = useState('intermediate'); // 'eli5' | 'beginner' | 'intermediate' | 'expert'

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [highlightLines, setHighlightLines] = useState(null);
  const abortControllerRef = useRef(null);

  // Ollama status & Model state
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [activeModel, setActiveModel] = useState('llama3.2');

  // History State
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('codelens_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings & Telemetry
  const [cacheStats, setCacheStats] = useState(null);

  // Fetch Ollama status
  const fetchOllamaStatus = async () => {
    try {
      const res = await fetch('/api/ollama/status');
      const data = await res.json();
      setOllamaStatus(data);
      if (data.models && data.models.length > 0 && !activeModel) {
        setActiveModel(data.models[0].name);
      }
    } catch (err) {
      setOllamaStatus({ online: false, mode: 'offline-smart-fallback' });
    }
  };

  // Fetch cache stats
  const fetchCacheStats = async () => {
    try {
      const res = await fetch('/api/cache/stats');
      const data = await res.json();
      setCacheStats(data);
    } catch {
      // server might not be ready yet
    }
  };

  useEffect(() => {
    fetchOllamaStatus();
    fetchCacheStats();
    const interval = setInterval(() => {
      fetchOllamaStatus();
      fetchCacheStats();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save history to localStorage
  const saveToHistory = (resultData) => {
    const entry = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      code,
      language,
      mode,
      level,
      summary: resultData?.data?.summary || 'Analysis session',
      data: resultData?.data
    };
    const updated = [entry, ...history.slice(0, 49)];
    setHistory(updated);
    localStorage.setItem('codelens_history', JSON.stringify(updated));
  };

  // Main Analysis Dispatcher
  const handleAnalyze = useCallback(async () => {
    if (!code || !code.trim()) {
      setError('Please paste or write some code in the editor before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          code,
          language,
          level,
          mode,
          model: activeModel
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || `Server responded with status ${res.status}`);
      }

      const responseData = await res.json();
      setAnalysisResult(responseData);
      saveToHistory(responseData);
      fetchCacheStats();
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Analysis cancelled by user.');
      } else {
        console.error('Analysis error:', err);
        setError(err.message || 'Analysis failed. Please check network connection or try again.');
      }
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [code, language, level, mode, activeModel, history]);

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeTab === 'studio' && mode !== 'chat' && !isAnalyzing) {
          e.preventDefault();
          handleAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnalyze, activeTab, mode, isAnalyzing]);

  // Redact secrets handler
  const handleRedactSecrets = () => {
    const findings = analysisResult?.meta?.secretsFound || [];
    if (findings.length === 0) return;
    let sanitized = code;
    sanitized = sanitized
      .replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED_API_KEY]')
      .replace(/gh[pousr]-[A-Za-z0-9_]{36,}/g, '[REDACTED_GITHUB_TOKEN]')
      .replace(/(?:password|secret|api[_-]?key)\s*[:=]\s*['"][^'"]+['"]/gi, 'password = "[REDACTED_SECRET]"');
    setCode(sanitized);
    setAnalysisResult(null);
  };

  // Apply fix or optimization directly to editor
  const handleApplyCode = (newCode) => {
    if (!newCode) return;
    setCode(newCode);
    setHighlightLines(null);
  };

  // Load saved session from history
  const handleLoadSession = (session) => {
    if (session.code) setCode(session.code);
    if (session.language) setLanguage(session.language);
    if (session.mode) setMode(session.mode);
    if (session.level) setLevel(session.level);
    if (session.data) {
      setAnalysisResult({ data: session.data, meta: { isCached: true } });
    }
  };

  // Delete history item
  const handleDeleteSession = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('codelens_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('codelens_history');
  };

  const handleClearCache = async () => {
    try {
      await fetch('/api/cache/clear', { method: 'POST' });
      fetchCacheStats();
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  };

  // Subdetail label for breadcrumbs
  const getSubdetail = () => {
    if (activeTab === 'studio') {
      if (mode === 'explain') return 'Logic Walkthrough';
      if (mode === 'debug') return 'Bug Diagnosis & Fix';
      if (mode === 'optimize') return 'Optimization Diff';
      if (mode === 'chat') return 'Follow-up Q&A';
    }
    return null;
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans ${theme === 'light' ? 'light-theme' : ''}`}>
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenStyleGuide={() => setIsStyleGuideOpen(true)}
        onOpenOllamaSetup={() => setIsOllamaSetupOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        ollamaStatus={ollamaStatus}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          subDetail={getSubdetail()} 
        />

        {/* Tab 1: Studio */}
        {activeTab === 'studio' && (
          <div className="flex flex-col gap-5 flex-1">
            
            {/* Analysis Controls Toolbar */}
            <AnalysisControls
              mode={mode}
              setMode={setMode}
              level={level}
              setLevel={setLevel}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onCancel={handleCancelAnalysis}
              activeModel={activeModel}
            />

            {/* Error Notification */}
            {error && (
              <div 
                role="alert"
                className="p-4 rounded-xl bg-rose-950/70 border border-rose-600/40 text-rose-200 text-xs flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="px-2.5 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-rose-300 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Main Studio Grid: Editor (Left) & Output Canvas (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[580px]">
              
              {/* Left Column: Monaco Code Editor */}
              <div className="lg:col-span-6 flex flex-col">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  highlightLines={highlightLines}
                  secretFindings={analysisResult?.meta?.secretsFound}
                  onRedactSecrets={handleRedactSecrets}
                  isAnalyzing={isAnalyzing}
                  theme={theme}
                />
              </div>

              {/* Right Column: Output Intelligence Canvas */}
              <div className="lg:col-span-6 flex flex-col">
                {mode === 'chat' ? (
                  /* Mode 4: Follow-up Conversational Q&A */
                  <FollowUpChat
                    code={code}
                    language={language}
                    activeModel={activeModel}
                  />
                ) : (
                  <div 
                    className="flex-1 glass-panel p-4 sm:p-5 flex flex-col overflow-y-auto max-h-[720px] shadow-xl"
                    aria-live="polite"
                  >
                    {isAnalyzing ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 p-[2px] animate-spin">
                            <div className="h-full w-full bg-slate-950 rounded-[14px]" />
                          </div>
                          <Sparkles className="h-6 w-6 text-sky-400 absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">
                            {ollamaStatus?.online ? `Streaming from local ${activeModel}...` : 'Processing with local heuristic engine...'}
                          </h4>
                          <p className="caption max-w-sm mt-1">
                            Simulating mental execution states, validating language invariants, and compiling insights.
                          </p>
                        </div>
                      </div>
                    ) : analysisResult ? (
                      <div className="space-y-5">
                        
                        {/* Mode 1: Explain Logic */}
                        {mode === 'explain' && (
                          <ExplanationView
                            data={analysisResult.data}
                            meta={analysisResult.meta}
                            onHoverLines={setHighlightLines}
                            selectedLines={highlightLines}
                          />
                        )}

                        {/* Mode 2: Debug & Bug Diagnosis */}
                        {mode === 'debug' && (
                          <DebugView
                            bugs={analysisResult.data?.bugs}
                            fixedFullCode={analysisResult.data?.correctedFullCode || analysisResult.data?.fixedFullCode}
                            onApplyFix={handleApplyCode}
                            onHoverLines={setHighlightLines}
                          />
                        )}

                        {/* Mode 3: Optimize & Refactor */}
                        {mode === 'optimize' && (
                          <OptimizationView
                            data={analysisResult.data}
                            meta={analysisResult.meta}
                            onApplyOptimization={handleApplyCode}
                          />
                        )}

                      </div>
                    ) : (
                      /* Initial Empty State */
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                        <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                          <Code2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-200">Local AI Code Intelligence</h3>
                        <p className="caption max-w-md mt-1.5 leading-relaxed">
                          Paste code or load a 15+ language sample, select an analysis mode above, and click <strong>{mode === 'explain' ? 'Explain Code' : mode === 'debug' ? 'Diagnose Bugs' : 'Optimize Code'}</strong>.
                        </p>
                        <button
                          onClick={handleAnalyze}
                          className="btn-primary mt-4 text-xs py-2 px-4"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Run First Analysis</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Prompt Lab */}
        {activeTab === 'prompt-lab' && (
          <PromptLab />
        )}

        {/* Tab 3: Tutorial */}
        {activeTab === 'tutorial' && (
          <TutorialView />
        )}

        {/* Tab 4: Benchmark Suite */}
        {activeTab === 'benchmark' && (
          <EvaluationDashboard />
        )}

      </main>

      {/* Modals & Drawers */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentLanguage={language}
        currentStrategy="ollama-local"
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cacheStats={cacheStats}
        onClearCache={handleClearCache}
      />

      <StyleGuideModal
        isOpen={isStyleGuideOpen}
        onClose={() => setIsStyleGuideOpen(false)}
      />

      <OllamaSetupModal
        isOpen={isOllamaSetupOpen}
        onClose={() => setIsOllamaSetupOpen(false)}
        ollamaStatus={ollamaStatus}
        onRefreshStatus={fetchOllamaStatus}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
      />

    </div>
  );
}
