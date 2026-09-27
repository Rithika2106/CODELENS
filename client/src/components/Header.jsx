import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  FlaskConical, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  MessageSquareHeart, 
  Database,
  Cpu,
  Menu,
  X,
  Palette,
  CheckCircle2,
  AlertCircle,
  History,
  Download
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onOpenFeedback, 
  onOpenStyleGuide,
  onOpenOllamaSetup,
  onOpenHistory,
  ollamaStatus,
  activeModel,
  setActiveModel,
  theme,
  setTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'studio', label: 'Code Studio', icon: Code2, badge: 'Core' },
    { id: 'prompt-lab', label: 'Prompt Lab', icon: FlaskConical, badge: 'Compare' },
    { id: 'tutorial', label: 'Prompting Academy', icon: GraduationCap, badge: 'Learn' },
    { id: 'benchmark', label: 'Eval Benchmarks', icon: BarChart3, badge: 'Tests' }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSelectTab('studio')}
            className="flex items-center gap-2.5 text-left focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
            aria-label="CodeLens AI Home"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-sky-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Code2 className="h-5 w-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CodeLens<span className="text-sky-400">.ai</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  <Sparkles className="h-2.5 w-2.5 text-sky-400" /> Local Ollama
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">AI Code Explainer & Debugger (100% Local)</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav 
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800"
        >
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Ollama Connection Status Button / Pill */}
          <button
            onClick={onOpenOllamaSetup}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              ollamaStatus?.online
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/30'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/30'
            }`}
            title="Ollama Connection Status (Click for Setup Guide)"
          >
            {ollamaStatus?.online ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ollama Online</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Offline Fallback</span>
              </>
            )}
          </button>

          {/* Model Selector if Models Available */}
          {ollamaStatus?.models?.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
              <Cpu className="h-3.5 w-3.5 text-sky-400" />
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                aria-label="Select Ollama Model"
              >
                {ollamaStatus.models.map(m => (
                  <option key={m.name} value={m.name} className="bg-slate-900 text-slate-100">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-300 hover:text-sky-300 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Saved Analysis History & Export"
            aria-label="Open Analysis History Drawer"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-300 hover:text-sky-300 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Configuration"
            aria-label="Open Settings Dialog"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="Toggle Mobile Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-3 animate-drawer shadow-2xl">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {tab.badge}
                  </span>
                </button>
              );
            })}

            {/* Mobile Setup Guide Trigger */}
            <button
              onClick={() => {
                onOpenOllamaSetup();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 border border-transparent min-h-[44px]"
            >
              <Cpu className="h-4 w-4 text-sky-400" />
              <span>Ollama Setup Guide</span>
            </button>

            {/* Mobile Style Guide Trigger */}
            <button
              onClick={() => {
                onOpenStyleGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 border border-transparent min-h-[44px]"
            >
              <Palette className="h-4 w-4 text-sky-400" />
              <span>Design System & Style Guide</span>
            </button>
          </nav>
        </div>
      )}

    </header>
  );
}
