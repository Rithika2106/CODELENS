import { OllamaService } from './ollamaService.js';
import { CodeLensPrompts } from '../prompts/codeLensPrompts.js';
import { runDeterministicChecks } from '../analysis/deterministicChecks.js';

export const EVALUATION_BENCHMARKS = [
  {
    id: 'test-1-python-colon',
    title: 'Test 1 — Python Missing Colon',
    language: 'python',
    mode: 'debug',
    expectedStatus: 'BUGGY',
    expectedBugKeyword: 'colon',
    code: `x = 10\nif x > 5\n    print(x)`
  },
  {
    id: 'test-2-python-undefined',
    title: 'Test 2 — Python Undefined Variable',
    language: 'python',
    mode: 'debug',
    expectedStatus: 'BUGGY',
    expectedBugKeyword: 'undefined',
    code: `x = 10\nprint(y)`
  },
  {
    id: 'test-3-python-correct',
    title: 'Test 3 — Python Correct Addition Function',
    language: 'python',
    mode: 'debug',
    expectedStatus: 'CORRECT',
    code: `def add(a, b):\n    return a + b\n\nprint(add(2, 3))`
  },
  {
    id: 'test-4-python-logic',
    title: 'Test 4 — Python Average Logic Bug (+1 Offset)',
    language: 'python',
    mode: 'debug',
    expectedStatus: 'BUGGY',
    expectedBugKeyword: 'average',
    code: `def average(numbers):\n    total = sum(numbers)\n    return total / len(numbers) + 1\n\nprint(average([10, 20, 30]))`
  },
  {
    id: 'test-5-js-undefined',
    title: 'Test 5 — JavaScript Undefined Variable',
    language: 'javascript',
    mode: 'debug',
    expectedStatus: 'BUGGY',
    expectedBugKeyword: 'undefined',
    code: `function greet(name) {\n    console.log(message);\n}\n\ngreet("Alice");`
  },
  {
    id: 'test-6-sql-null',
    title: 'Test 6 — SQL NULL Comparison (= NULL vs IS NULL)',
    language: 'sql',
    mode: 'debug',
    expectedStatus: 'BUGGY',
    expectedBugKeyword: 'NULL',
    code: `SELECT id, username, email\nFROM users\nWHERE email = NULL;`
  },
  {
    id: 'test-7-c-correct',
    title: 'Test 7 — C Correct Program',
    language: 'c',
    mode: 'debug',
    expectedStatus: 'CORRECT',
    code: `#include <stdio.h>\n\nint main() {\n    int x = 10;\n    printf("%d\\n", x);\n    return 0;\n}`
  }
];

export class EvalService {
  constructor() {
    this.history = [];
  }

  async evaluateFixture(fixture, strategy = 'combined') {
    const startTime = Date.now();

    // 1. Run deterministic static checks
    const deterministic = runDeterministicChecks(fixture.code, fixture.language);

    // 2. Build prompt
    const promptBundle = CodeLensPrompts.buildPrompt({
      code: fixture.code,
      language: fixture.language,
      mode: fixture.mode,
      level: 'intermediate'
    });

    // 3. Generate response
    const result = await OllamaService.generate(promptBundle);
    const durationMs = Date.now() - startTime;

    // 4. Calculate quality metrics
    const data = result.data || {};
    const status = (data.status || (data.bugs?.length ? 'BUGGY' : 'CORRECT')).toUpperCase();

    const isStatusMatch = status === fixture.expectedStatus;

    // Check keyword presence if bug expected
    let keywordMatch = true;
    if (fixture.expectedBugKeyword) {
      const textDump = JSON.stringify(data).toLowerCase();
      keywordMatch = textDump.includes(fixture.expectedBugKeyword.toLowerCase());
    }

    const passed = isStatusMatch && (fixture.expectedStatus === 'CORRECT' || keywordMatch || deterministic.hasDeterministicErrors);

    return {
      fixtureId: fixture.id,
      title: fixture.title,
      language: fixture.language,
      expectedStatus: fixture.expectedStatus,
      actualStatus: status,
      passed,
      durationMs,
      deterministicErrors: deterministic.findings.length,
      isFallback: result.meta?.isFallback || false
    };
  }

  async runSuite(strategy = 'combined') {
    const startTime = Date.now();
    const results = [];

    for (const fixture of EVALUATION_BENCHMARKS) {
      const single = await this.evaluateFixture(fixture, strategy);
      results.push(single);
    }

    const totalDurationMs = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const passRate = totalCount > 0 ? `${Math.round((passedCount / totalCount) * 100)}%` : '100%';

    const report = {
      id: `suite-${Date.now()}`,
      timestamp: new Date().toISOString(),
      strategy,
      totalCount,
      passedCount,
      passRate,
      totalDurationMs,
      averageLatencyMs: Math.round(totalDurationMs / totalCount),
      results
    };

    this.history.unshift(report);
    if (this.history.length > 20) {
      this.history.pop();
    }

    return report;
  }

  getHistory() {
    return this.history;
  }
}

export const evalService = new EvalService();
