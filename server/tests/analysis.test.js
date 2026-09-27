import { test, describe } from 'node:test';
import assert from 'node:assert';
import { runDeterministicChecks } from '../analysis/deterministicChecks.js';
import {
  extractAndParseJSON,
  verifyLineAndSnippet,
  validateAndNormalizeResult
} from '../analysis/resultValidator.js';

describe('Deterministic Static Checking Layer', () => {
  test('Test 1 — Python missing colon detection', () => {
    const code = `x = 10\nif x > 5\n    print(x)`;
    const result = runDeterministicChecks(code, 'python');
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.hasDeterministicErrors, true);
    assert.ok(result.findings.length > 0);
    const colonError = result.findings.find(f => f.title.toLowerCase().includes('missing colon'));
    assert.ok(colonError, 'Should detect missing colon');
    assert.strictEqual(colonError.line, 2);
    assert.strictEqual(colonError.severity, 'error');
  });

  test('Test 2 — Python undefined variable detection', () => {
    const code = `x = 10\nprint(y)`;
    const result = runDeterministicChecks(code, 'python');
    assert.strictEqual(result.passed, false);
    const undefError = result.findings.find(f => f.title.toLowerCase().includes('undefined variable'));
    assert.ok(undefError, 'Should detect undefined variable y');
    assert.strictEqual(undefError.line, 2);
  });

  test('Test 3 — Correct Python passes deterministic checks without errors', () => {
    const code = `def add(a, b):\n    return a + b\n\nprint(add(2, 3))`;
    const result = runDeterministicChecks(code, 'python');
    assert.strictEqual(result.hasDeterministicErrors, false);
    assert.strictEqual(result.findings.length, 0);
  });

  test('Test 5 — JavaScript undefined variable in function', () => {
    const code = `function greet(name) {\n    console.log(message);\n}`;
    const result = runDeterministicChecks(code, 'javascript');
    assert.strictEqual(result.hasDeterministicErrors, true);
    const err = result.findings.find(f => f.title.toLowerCase().includes('undefined variable'));
    assert.ok(err);
    assert.strictEqual(err.line, 2);
  });

  test('Test 6 — SQL NULL issue detection (= NULL vs IS NULL)', () => {
    const code = `SELECT * FROM users WHERE email = NULL;`;
    const result = runDeterministicChecks(code, 'sql');
    assert.strictEqual(result.hasDeterministicErrors, true);
    const err = result.findings.find(f => f.title.toLowerCase().includes('null comparison'));
    assert.ok(err);
    assert.strictEqual(err.line, 1);
    assert.ok(err.problem.includes('IS NULL'));
  });

  test('Test 7 — Correct C passes deterministic checks', () => {
    const code = `#include <stdio.h>\nint main() {\n    int x = 10;\n    printf("%d\\n", x);\n    return 0;\n}`;
    const result = runDeterministicChecks(code, 'c');
    assert.strictEqual(result.hasDeterministicErrors, false);
    assert.strictEqual(result.findings.length, 0);
  });

  test('Java division by an initialized zero variable is reported at the operation line', () => {
    const sourceCode = `public class Main {\n    int b = 0;\n    int x = a / b;\n}`;
    const deterministic = runDeterministicChecks(sourceCode, 'java');
    const finding = deterministic.findings.find(item => item.title.includes('division by zero'));

    assert.strictEqual(deterministic.hasDeterministicErrors, true);
    assert.ok(finding);
    assert.strictEqual(finding.line, 3);
    assert.ok(finding.root_cause.includes("'b'"));
    assert.ok(finding.what_happens.includes('ArithmeticException: / by zero'));
    assert.ok(finding.corrected_code.includes('if (b == 0)'));
  });

  test('Java modulo by an initialized zero variable is reported as BUGGY by the validator', () => {
    const sourceCode = `int b = 0;\nint x = a % b;`;
    const deterministic = runDeterministicChecks(sourceCode, 'java');
    const validated = validateAndNormalizeResult({
      rawOutput: { status: 'CORRECT', explanation: 'Code looks good', errors: [] },
      sourceCode,
      language: 'java',
      deterministicChecks: deterministic
    });

    assert.strictEqual(validated.status, 'BUGGY');
    assert.strictEqual(validated.errors[0].line, 2);
    assert.strictEqual(validated.errors[0].verified, true);
    assert.ok(validated.fixed_code.includes('if (b == 0)'));
    assert.ok(validated.errors[0].why_fix_works.includes('guard'));
    assert.ok(validated.errors[0].prevention_tip.includes('zero-valued inputs'));
  });

  test('Java direct integer literal zero divisor is detected', () => {
    const result = runDeterministicChecks('int x = 10 / 0;', 'java');
    const finding = result.findings.find(item => item.title.includes('division by zero'));

    assert.strictEqual(finding.line, 1);
    assert.ok(finding.corrected_code.includes('codeLensDivisor1'));
  });

  test('Java modulo by a direct zero literal is detected', () => {
    const result = runDeterministicChecks('int x = 10 % 0;', 'java');

    assert.ok(result.findings.some(item => item.title.includes('modulo by zero')));
  });

  test('Java nonzero and unknown integer divisors are not flagged', () => {
    const nonzero = runDeterministicChecks('int b = 2;\nint x = a / b;', 'java');
    const unknown = runDeterministicChecks('int x = a / b;', 'java');

    assert.strictEqual(nonzero.hasDeterministicErrors, false);
    assert.strictEqual(unknown.hasDeterministicErrors, false);
  });

  test('Java non-integer division and zero in comments or strings are not flagged', () => {
    const code = `double ratio = a / 0.0;\nString text = "a / 0";\n// a % 0`;
    const result = runDeterministicChecks(code, 'java');

    assert.strictEqual(result.hasDeterministicErrors, false);
  });

  test('Bracket matching catches unclosed and mismatched brackets', () => {
    const unclosed = `function test() { console.log("hi");`;
    const res1 = runDeterministicChecks(unclosed, 'javascript');
    assert.strictEqual(res1.hasDeterministicErrors, true);
    assert.ok(res1.findings.some(f => f.title.toLowerCase().includes('unclosed bracket')));

    const mismatched = `const arr = [1, 2, 3);`;
    const res2 = runDeterministicChecks(mismatched, 'javascript');
    assert.strictEqual(res2.hasDeterministicErrors, true);
    assert.ok(res2.findings.some(f => f.title.toLowerCase().includes('mismatched bracket')));
  });
});

describe('JSON Extraction & Result Validation', () => {
  test('Recovers JSON from markdown fenced code block', () => {
    const raw = '```json\n{\n  "status": "CORRECT",\n  "explanation": "Code is clean"\n}\n```';
    const parsed = extractAndParseJSON(raw);
    assert.strictEqual(parsed.status, 'CORRECT');
    assert.strictEqual(parsed.explanation, 'Code is clean');
  });

  test('Recovers JSON with trailing commas and surrounding commentary', () => {
    const raw = `Here is your analysis:\n{\n  "status": "BUGGY",\n  "explanation": "Broken",\n}\nHope this helps!`;
    const parsed = extractAndParseJSON(raw);
    assert.strictEqual(parsed.status, 'BUGGY');
  });

  test('Line verification matches correct lines and clamps impossible line numbers', () => {
    const source = `def foo():\n    x = 10\n    return x`;
    const lines = source.split('\n');

    // Case 1: Valid line & matching snippet
    const err1 = { line: 2, snippet: 'x = 10', title: 'Bug' };
    const res1 = verifyLineAndSnippet(err1, lines);
    assert.strictEqual(res1.verified, true);
    assert.strictEqual(res1.line, 2);

    // Case 2: AI returned wrong line number 99 but snippet exists on line 3
    const err2 = { line: 99, snippet: 'return x', title: 'Return bug' };
    const res2 = verifyLineAndSnippet(err2, lines);
    assert.strictEqual(res2.verified, true);
    assert.strictEqual(res2.line, 3);

    // Case 3: Impossible line number 500 with non-existent snippet
    const err3 = { line: 500, snippet: 'nonexistent code line', title: 'Fake bug' };
    const res3 = verifyLineAndSnippet(err3, lines);
    assert.strictEqual(res3.verified, false);
    assert.strictEqual(res3.line, null); // Clamped to null so no random highlight
  });

  test('validateAndNormalizeResult enforces CORRECT state contracts', () => {
    const sourceCode = `def add(a, b):\n    return a + b`;
    const rawOutput = JSON.stringify({
      status: 'CORRECT',
      explanation: 'Adds two numbers together.',
      errors: []
    });

    const validated = validateAndNormalizeResult({
      rawOutput,
      sourceCode,
      language: 'python',
      mode: 'debug'
    });

    assert.strictEqual(validated.status, 'CORRECT');
    assert.ok(validated.explanation.includes('No obvious errors detected'));
    assert.deepStrictEqual(validated.errors, []);
  });

  test('validateAndNormalizeResult enforces BUGGY when deterministic errors exist', () => {
    const sourceCode = `x = 10\nif x > 5\n    print(x)`;
    const deterministic = runDeterministicChecks(sourceCode, 'python');
    // Simulate AI hallucinating that buggy code is correct
    const fakeAiOutput = JSON.stringify({
      status: 'CORRECT',
      explanation: 'Code looks good',
      errors: []
    });

    const validated = validateAndNormalizeResult({
      rawOutput: fakeAiOutput,
      sourceCode,
      language: 'python',
      mode: 'debug',
      deterministicChecks: deterministic
    });

    assert.strictEqual(validated.status, 'BUGGY', 'Must override false CORRECT when deterministic syntax error exists');
    assert.ok(validated.errors.length > 0);
    assert.ok(validated.errors.some(e => e.title.includes('missing colon')));
  });

  test('Test 4 — Handles Logic Bug output correctly', () => {
    const sourceCode = `def average(numbers):\n    total = sum(numbers)\n    return total / len(numbers) + 1`;
    const aiOutput = JSON.stringify({
      status: 'BUGGY',
      errors: [
        {
          severity: 'error',
          line: 3,
          snippet: 'return total / len(numbers) + 1',
          title: 'Incorrect arithmetic in average calculation',
          what_it_is_trying_to_do: 'Calculate the mathematical mean of numbers',
          problem: 'Adding + 1 artificially skews the average result by 1.',
          root_cause: 'Unnecessary +1 offset on the arithmetic division.',
          what_happens: 'Returns incorrect average (e.g., average of [2, 4] gives 4 instead of 3).',
          fix: 'return total / len(numbers)',
          why_fix_works: 'Divides total sum by count of elements without offset.',
          prevention_tip: 'Write unit tests with known input-output pairs to catch logic formula bugs.'
        }
      ],
      fixed_code: `def average(numbers):\n    if not numbers:\n        return 0\n    total = sum(numbers)\n    return total / len(numbers)`
    });

    const validated = validateAndNormalizeResult({
      rawOutput: aiOutput,
      sourceCode,
      language: 'python',
      mode: 'debug'
    });

    assert.strictEqual(validated.status, 'BUGGY');
    assert.strictEqual(validated.errors.length, 1);
    assert.strictEqual(validated.errors[0].verified, true);
    assert.strictEqual(validated.errors[0].line, 3);
  });

  test('Offline fallback returns deterministic check results safely', () => {
    const sourceCode = `x = 10\nprint(y)`;
    const deterministic = runDeterministicChecks(sourceCode, 'python');
    const offlineResult = validateAndNormalizeResult({
      rawOutput: null,
      sourceCode,
      language: 'python',
      mode: 'debug',
      deterministicChecks: deterministic
    });

    assert.strictEqual(offlineResult.status, 'BUGGY');
    assert.strictEqual(offlineResult.errors.length, 1);
    assert.strictEqual(offlineResult.errors[0].line, 2);
    assert.strictEqual(offlineResult.meta.isFallback, true);
  });
});
