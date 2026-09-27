import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  X, 
  Search, 
  FileCode2, 
  Clock, 
  ChevronRight, 
  FileText, 
  Printer,
  Sparkles
} from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onLoadSession,
  onDeleteSession,
  onClearHistory
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.language || '').toLowerCase().includes(q) ||
      (item.summary || '').toLowerCase().includes(q) ||
      (item.code || '').toLowerCase().includes(q)
    );
  });

  const handleExportMarkdown = (item) => {
    let md = `# CodeLens Analysis Report — ${item.language?.toUpperCase()} Code\n\n`;
    md += `**Date:** ${new Date(item.timestamp).toLocaleString()}\n`;
    md += `**Mode:** ${item.mode?.toUpperCase()} | **Level:** ${item.level}\n\n`;
    md += `## Original Source Code\n\`\`\`${item.language}\n${item.code}\n\`\`\`\n\n`;
    md += `## Executive Summary\n${item.summary || 'N/A'}\n\n`;

    if (item.data?.bugs?.length > 0) {
      md += `## Bug Diagnostics (${item.data.bugs.length} Issues)\n`;
      item.data.bugs.forEach((b, i) => {
        md += `### ${i + 1}. [${b.severity?.toUpperCase()}] ${b.title}\n`;
        md += `- **Line:** ${b.line || 'N/A'}\n`;
        md += `- **Root Cause:** ${b.rootCause}\n`;
        if (b.fixDiff?.proposed) {
          md += `- **Proposed Fix:**\n\`\`\`${item.language}\n${b.fixDiff.proposed}\n\`\`\`\n`;
        }
      });
      md += `\n`;
    }

    if (item.data?.complexity) {
      md += `## Algorithmic Complexity\n`;
      md += `- **Time Complexity:** ${item.data.complexity.time || 'N/A'}\n`;
      md += `- **Space Complexity:** ${item.data.complexity.space || 'N/A'}\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelens-analysis-${item.language}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = (item) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelens-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
    >
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-sky-400" />
            <h3 id="history-drawer-title" className="text-base font-bold text-white">Analysis History</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {history.length} saved
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            aria-label="Close history drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Bulk Actions */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous analyses..."
              className="form-input pl-8 py-1.5 text-xs bg-slate-950 border-slate-800 w-full"
            />
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 text-xs"
              title="Clear all history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
              >
                {/* Top Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {item.language}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {item.mode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Summary / Preview */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.summary || item.data?.summary || 'No executive summary.'}
                </p>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportMarkdown(item)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 hover:text-sky-300 border border-slate-800 flex items-center gap-1"
                      title="Export as Markdown"
                    >
                      <FileText className="h-3 w-3" /> Markdown
                    </button>
                    <button
                      onClick={() => handleExportJSON(item)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 hover:text-sky-300 border border-slate-800 flex items-center gap-1"
                      title="Export as JSON"
                    >
                      <Download className="h-3 w-3" /> JSON
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onLoadSession(item);
                        onClose();
                      }}
                      className="btn-primary text-[11px] py-0.5 px-2.5 min-h-[26px]"
                    >
                      Load Session
                    </button>
                    <button
                      onClick={() => onDeleteSession(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-2">
              <History className="h-8 w-8 text-slate-600" />
              <p>No saved analysis sessions found.</p>
              <p className="text-[11px]">Run any analysis to automatically record history here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
