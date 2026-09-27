import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Code2, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  FileCode2, 
  Lock 
} from 'lucide-react';
import { SAMPLE_SNIPPETS } from './SampleSnippets';

export default function CodeEditor({
  code,
  setCode,
  language,
  setLanguage,
  highlightLines,
  secretFindings = [],
  onRedactSecrets,
  isAnalyzing,
  theme = 'dark'
}) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const languagesList = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash / Shell' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSelectPreset = (e) => {
    const presetId = e.target.value;
    if (!presetId) return;
    const snippet = SAMPLE_SNIPPETS.find(s => s.id === presetId);
    if (snippet) {
      setCode(snippet.code);
      setLanguage(snippet.language);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Sync line highlighting when user hovers or clicks explanation sections
  useEffect(() => {
    if (!editorRef.current || !highlightLines) {
      if (editorRef.current && decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    const { startLine = 1, endLine = 1 } = highlightLines;
    const decorations = [
      {
        range: {
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: 1000
        },
        options: {
          isWholeLine: true,
          className: 'highlight-code-target',
          marginClassName: 'highlight-code-margin'
        }
      }
    ];

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, decorations);
    editorRef.current.revealLineInCenter(startLine);
  }, [highlightLines]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden min-h-[480px]">
      
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 gap-2">
        
        {/* Left: Language selector & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <FileCode2 className="h-3.5 w-3.5 text-sky-400" />
            <label htmlFor="editor-lang-select" className="sr-only">Source Code Language</label>
            <select
              id="editor-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {languagesList.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-slate-900 text-slate-100">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sample Preset Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="sample-preset-select" className="sr-only">Load Sample Code Preset</label>
            <select
              id="sample-preset-select"
              onChange={handleSelectPreset}
              defaultValue=""
              className="form-select bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:border-sky-500 cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            >
              <option value="" disabled>Load Sample (15+ Languages)...</option>
              {SAMPLE_SNIPPETS.map(snippet => (
                <option key={snippet.id} value={snippet.id} className="bg-slate-900 text-slate-200">
                  [{snippet.language.toUpperCase()}] {snippet.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs py-1 px-2.5 min-h-[34px] flex items-center gap-1"
            title="Copy snippet"
            aria-label="Copy code snippet to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Clear editor"
            aria-label="Clear code editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Secret / PII Warning Banner */}
      {secretFindings && secretFindings.length > 0 && (
        <div 
          role="alert"
          className="bg-amber-950/70 border-b border-amber-600/40 px-3.5 py-2.5 flex items-center justify-between text-xs text-amber-200"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Security Guard:</strong> Detected potential credential ({secretFindings[0].type}) on line {secretFindings[0].line}.
            </span>
          </div>
          <button
            onClick={onRedactSecrets}
            className="btn-outline text-xs py-1 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 font-semibold"
          >
            <Lock className="h-3 w-3" />
            <span>Redact Secrets</span>
          </button>
        </div>
      )}

      {/* Monaco Code Editor Canvas */}
      <div className="relative flex-1 min-h-[380px]">
        <Editor
          height="100%"
          language={language === 'csharp' ? 'csharp' : language === 'bash' ? 'shell' : language}
          value={code}
          theme={theme === 'light' ? 'light' : 'vs-dark'}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            lineNumbers: 'on',
            roundedSelection: true,
            automaticLayout: true,
            tabSize: 2,
            readOnly: isAnalyzing,
            cursorBlinking: 'smooth',
            padding: { top: 12, bottom: 12 },
            accessibilitySupport: 'on'
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{code.split('\n').length} lines</span>
          <span>{code.length} characters</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Code2 className="h-3 w-3 text-sky-400" />
          <span>Local execution sandbox (Strict zero-cloud privacy)</span>
        </div>
      </div>

    </div>
  );
}
