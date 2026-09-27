import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  User, 
  Bot, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function FollowUpChat({ code, language, activeModel }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I have loaded your **${language.toUpperCase()}** code into context. You can ask me any follow-up questions, such as:\n- *"How would this handle edge cases like empty collections or null?"*\n- *"Can you refactor this to use functional programming patterns?"*\n- *"Explain the time and space complexity bottlenecks."*\n\nWhat would you like to explore?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    'How does this handle edge cases (empty, null, bounds)?',
    'Can you refactor this to be more idiomatic and concise?',
    'Explain the asymptotic Time & Space complexity in detail.',
    'Are there any concurrency or race condition hazards?'
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    const newMessages = [...messages, { role: 'user', content: query.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role === 'user' || m.role === 'assistant'),
          contextCode: code,
          language,
          model: activeModel
        })
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'No response received.'
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error generating response: ${err.message}. Please check if Ollama is running or try again.`
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. Your active **${language.toUpperCase()}** code remains in context. Ask me anything!`
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full glass-card border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden min-h-[500px]">
      
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Follow-up Q&A Thread (Context Retained)
            </h3>
            <span className="text-[10px] text-slate-400">Active Code Context: {language.toUpperCase()} ({code.split('\n').length} lines)</span>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
          title="Reset conversation"
          aria-label="Reset chat history"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <span className="label-text flex items-center gap-1 text-[10px] whitespace-nowrap text-slate-400">
          <Lightbulb className="h-3 w-3 text-amber-400" /> Suggestions:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isSending}
            className="text-[11px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message History Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[440px]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isUser 
                  ? 'bg-sky-500 text-slate-950' 
                  : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                isUser
                  ? 'bg-sky-500 text-slate-950 font-medium shadow-md shadow-sky-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="text-slate-400 hover:text-sky-300 text-[10px] flex items-center gap-1"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse pl-9">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>CodeLens AI is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question about this code..."
          disabled={isSending}
          className="form-input bg-slate-900 border-slate-800 text-xs flex-1"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="btn-primary text-xs py-2 px-3.5 min-h-[36px]"
          aria-label="Send follow-up question"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

    </div>
  );
}
