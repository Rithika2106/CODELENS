import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LRUCache } from '../cache/lruCache.js';
import { EvalService, EVALUATION_BENCHMARKS } from '../services/evalService.js';
import { OllamaService } from '../services/ollamaService.js';
import { FeedbackService } from '../services/feedbackService.js';
import { config } from '../config.js';
import {
  ROLE_PERSONAS,
  LEVEL_GUIDELINES,
  LANGUAGE_CONTEXT_HINTS,
  NAIVE_VS_ENGINEERED_PRESETS
} from '../prompts/templates.js';

describe('CodeLens supporting services', () => {
  test('cache keys include nested values and ignore object property order', () => {
    const cache = new LRUCache();
    const first = cache.generateKey({ request: { code: 'a', language: 'python' } });
    const reordered = cache.generateKey({ request: { language: 'python', code: 'a' } });
    const different = cache.generateKey({ request: { code: 'b', language: 'python' } });

    assert.strictEqual(first, reordered);
    assert.notStrictEqual(first, different);
  });

  test('cache returns values, tracks hits, and evicts least-recently-used entries', () => {
    const cache = new LRUCache(2);
    cache.set('first', { result: 1 });
    cache.set('second', { result: 2 });
    assert.deepStrictEqual(cache.get('first'), { result: 1 });
    cache.set('third', { result: 3 });

    assert.strictEqual(cache.get('second'), null);
    assert.deepStrictEqual(cache.getStats(), {
      size: 2,
      maxEntries: 2,
      hits: 1,
      misses: 1,
      hitRate: '50.0%',
      ttlHours: '24'
    });

    cache.clear();
    assert.strictEqual(cache.getStats().size, 0);
    assert.strictEqual(cache.getStats().hits, 0);
  });

  test('evaluation suite records a report in bounded service history', async () => {
    const service = new EvalService();
    const originalGenerate = OllamaService.generate;
    OllamaService.generate = async () => ({
      success: true,
      data: { status: 'CORRECT', errors: [] },
      meta: { isFallback: true }
    });

    try {
      const report = await service.runSuite('combined');
      assert.strictEqual(report.totalCount, EVALUATION_BENCHMARKS.length);
      assert.strictEqual(report.results.length, EVALUATION_BENCHMARKS.length);
      assert.strictEqual(report.strategy, 'combined');
      assert.strictEqual(service.getHistory()[0], report);
    } finally {
      OllamaService.generate = originalGenerate;
    }
  });

  test('Ollama generation and chat use the configured request timeout', async () => {
    const originalFetch = globalThis.fetch;
    const originalSetTimeout = globalThis.setTimeout;
    const delays = [];
    globalThis.fetch = async url => {
      if (url.endsWith('/api/tags')) {
        return { ok: true, json: async () => ({ models: [{ name: config.ollama.defaultModel }] }) };
      }
      if (url.endsWith('/api/chat')) {
        return { ok: true, json: async () => ({ message: { content: 'Chat response' } }) };
      }
      return { ok: true, json: async () => ({ response: JSON.stringify({ status: 'CORRECT', explanation: 'Valid code' }) }) };
    };
    globalThis.setTimeout = (callback, delay, ...args) => {
      delays.push(delay);
      return originalSetTimeout(callback, delay, ...args);
    };

    try {
      await OllamaService.generate({
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        securePayload: { rawCode: 'value = 1' },
        language: 'python',
        mode: 'debug'
      });
      const chat = await OllamaService.chat([{ role: 'user', content: 'Explain this code' }], 'value = 1');
      assert.ok(delays.includes(config.ollama.timeoutMs));
      assert.strictEqual(chat.reply, 'Chat response');
      assert.strictEqual(delays.filter(delay => delay === config.ollama.timeoutMs).length, 2);
    } finally {
      globalThis.fetch = originalFetch;
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  test('feedback service records submissions and reports aggregate stats', () => {
    const service = new FeedbackService();
    const saved = service.addFeedback({
      rating: 4,
      helpful: false,
      comment: 'Needs a clearer explanation',
      codeSnippet: 'print(1)',
      language: 'python',
      mode: 'explain'
    });
    const stats = service.getStats();

    assert.strictEqual(saved.rating, 4);
    assert.strictEqual(saved.helpful, false);
    assert.strictEqual(stats.totalFeedback, 1);
    assert.strictEqual(stats.helpfulCount, 0);
    assert.strictEqual(stats.satisfactionRate, '0%');
    assert.strictEqual(stats.averageRating, 4);
    assert.strictEqual(stats.recentFeedback[0].id, saved.id);
  });

  test('prompt preset exports provide content for API responses', () => {
    assert.ok(Object.keys(ROLE_PERSONAS).length > 0);
    assert.ok(Object.keys(LEVEL_GUIDELINES).length > 0);
    assert.ok(Object.keys(LANGUAGE_CONTEXT_HINTS).length > 0);
    assert.ok(NAIVE_VS_ENGINEERED_PRESETS.length > 0);
  });
});