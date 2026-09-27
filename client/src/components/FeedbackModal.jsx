import React, { useState, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  CheckCircle2, 
  BarChart2, 
  X 
} from 'lucide-react';

const FEEDBACK_TAGS = [
  'Accurate Logic',
  'Clear Breakdown',
  'Great Fix Diff',
  'Helpful Complexity Notes',
  'Too Verbose',
  'Missed Edge Case',
  'Hallucinated Step',
  'Confusing Explanation'
];

export default function FeedbackModal({ isOpen, onClose, currentLanguage, currentStrategy }) {
  const [rating, setRating] = useState(5);
  const [thumbs, setThumbs] = useState('up');
  const [selectedTags, setSelectedTags] = useState(['Accurate Logic', 'Clear Breakdown']);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/feedback/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      setSubmitted(false);

      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          thumbs,
          tags: selectedTags,
          comment,
          language: currentLanguage,
          strategy: currentStrategy
        })
      });
      setSubmitted(true);
      fetchStats();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div className="glass-panel w-full max-w-lg p-6 border-slate-700 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-rose-400" />
            <h3 id="feedback-dialog-title" className="text-base font-bold text-white">Rate Explanation & Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            aria-label="Close feedback dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
            <h4 className="text-base font-bold text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-300">
              Your rating has been logged in our evaluation telemetry engine for continuous prompt refinement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Star Rating & Thumbs */}
            <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setThumbs('up')}
                  className={`p-2 rounded-lg border transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                    thumbs === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  aria-label="Thumbs up"
                  aria-pressed={thumbs === 'up'}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setThumbs('down')}
                  className={`p-2 rounded-lg border transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                    thumbs === 'down'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  aria-label="Thumbs down"
                  aria-pressed={thumbs === 'down'}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Categorical Tags */}
            <div>
              <span className="label-text block mb-2">Quality & Accuracy Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments Field */}
            <div>
              <label htmlFor="feedback-comment-input" className="label-text block mb-1">Detailed Observations (Optional):</label>
              <textarea
                id="feedback-comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was helpful or what could be explained better?"
                rows={3}
                className="form-textarea w-full bg-slate-950/90 border-slate-800 text-xs text-slate-200 resize-none font-sans"
              />
            </div>

            {/* Community Stats Bar */}
            {stats && stats.total > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <BarChart2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Community: <strong>{stats.averageRating} ★</strong> ({stats.total} reviews)</span>
                </span>
                <span className="text-emerald-400 font-semibold">{stats.satisfactionRate} Positive</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-xs font-bold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Evaluation Feedback</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
