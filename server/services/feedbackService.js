export class FeedbackService {
  constructor() {
    this.feedbacks = [];
  }

  addFeedback({ rating, helpful, comment, codeSnippet, language, mode }) {
    const entry = {
      id: Date.now().toString(),
      rating: typeof rating === 'number' ? rating : 5,
      helpful: helpful !== undefined ? Boolean(helpful) : true,
      comment: (comment || '').slice(0, 1000),
      codeSnippet: (codeSnippet || '').slice(0, 500),
      language: language || 'unknown',
      mode: mode || 'debug',
      createdAt: new Date().toISOString()
    };

    this.feedbacks.unshift(entry);
    if (this.feedbacks.length > 200) {
      this.feedbacks.pop();
    }

    return entry;
  }

  getStats() {
    const total = this.feedbacks.length;
    const helpfulCount = this.feedbacks.filter(f => f.helpful).length;
    const avgRating = total > 0
      ? (this.feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1)
      : '5.0';

    return {
      totalFeedback: total,
      helpfulCount,
      satisfactionRate: total > 0 ? `${Math.round((helpfulCount / total) * 100)}%` : '100%',
      averageRating: parseFloat(avgRating),
      recentFeedback: this.feedbacks.slice(0, 10)
    };
  }
}

export const feedbackService = new FeedbackService();
