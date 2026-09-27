import React from 'react';
import { ChevronRight, Home, Code2, FlaskConical, GraduationCap, BarChart3 } from 'lucide-react';

export default function Breadcrumbs({ activeTab, setActiveTab, subDetail }) {
  const tabConfig = {
    'studio': { label: 'Code Studio', icon: Code2 },
    'prompt-lab': { label: 'Prompt Lab', icon: FlaskConical },
    'tutorial': { label: 'Prompting Academy', icon: GraduationCap },
    'benchmark': { label: 'Eval Benchmarks', icon: BarChart3 }
  };

  const current = tabConfig[activeTab] || tabConfig['studio'];
  const CurrentIcon = current.icon;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        
        {/* Root */}
        <li className="flex items-center">
          <button
            onClick={() => setActiveTab('studio')}
            className="flex items-center gap-1 text-slate-400 hover:text-sky-300 transition-colors p-1 rounded focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="CodeLens Home"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">CodeLens AI</span>
          </button>
        </li>

        <li aria-hidden="true" className="text-slate-600">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>

        {/* Current Tab */}
        <li className="flex items-center">
          <span 
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-semibold ${
              !subDetail ? 'text-sky-300 bg-sky-950/40 border border-sky-800/40' : 'text-slate-300'
            }`}
            aria-current={!subDetail ? 'page' : undefined}
          >
            <CurrentIcon className="h-3.5 w-3.5 text-sky-400" />
            <span>{current.label}</span>
          </span>
        </li>

        {/* Optional Sub-detail */}
        {subDetail && (
          <>
            <li aria-hidden="true" className="text-slate-600">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <span 
                className="text-slate-200 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold"
                aria-current="page"
              >
                {subDetail}
              </span>
            </li>
          </>
        )}

      </ol>
    </nav>
  );
}
