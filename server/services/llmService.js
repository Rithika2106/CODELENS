import { runDeterministicChecks } from '../analysis/deterministicChecks.js';
import { validateAndNormalizeResult } from '../analysis/resultValidator.js';
import { OllamaService } from './ollamaService.js';

export class LLMService {
  /**
   * High-accuracy offline heuristic & deterministic analysis engine
   */
  static async callOfflineEngine(promptBundle) {
    const rawCode = promptBundle.securePayload?.rawCode || '';
    const language = (promptBundle.language || 'python').toLowerCase();
    const mode = promptBundle.mode || 'debug';

    // 1. Run deterministic static checks
    const deterministic = runDeterministicChecks(rawCode, language);

    // 2. Derive basic structure and complexity
    const lines = rawCode.split('\n');
    const isLooping = /for|while/i.test(rawCode);
    const isNestedLoop = /for.*[\s\S]*for|while.*[\s\S]*while/i.test(rawCode);
    const isRecursive = /def\s+(\w+)[\s\S]*\1\(|function\s+(\w+)[\s\S]*\2\(/i.test(rawCode);

    const timeComplexity = isNestedLoop ? 'O(n²)' : isRecursive ? 'O(2ⁿ) or O(n log n)' : isLooping ? 'O(n)' : 'O(1)';
    const spaceComplexity = isRecursive ? 'O(n) call stack frames' : /\[\]|\{\}|new\s+/i.test(rawCode) ? 'O(n)' : 'O(1)';

    const hasBugs = deterministic.hasDeterministicErrors;

    const breakdown = lines
      .map((l, i) => ({
        step: i + 1,
        lines: `Line ${i + 1}`,
        title: `Execute line ${i + 1}`,
        description: l.trim() ? `Evaluates: \`${l.trim()}\`` : 'Empty line'
      }))
      .filter(s => s.description !== 'Empty line')
      .slice(0, 8);

    const explanationText = hasBugs
      ? `Static checks identified ${deterministic.findings.length} issue(s) in the ${language} code.`
      : 'No obvious errors detected. The code appears structurally valid.';

    const normalizedResult = validateAndNormalizeResult({
      rawOutput: {
        status: hasBugs ? 'BUGGY' : 'CORRECT',
        summary: explanationText,
        explanation: explanationText,
        errors: deterministic.findings,
        fixed_code: hasBugs && deterministic.findings[0]?.fix
          ? rawCode.replace(deterministic.findings[0].snippet, deterministic.findings[0].fix)
          : rawCode,
        purpose: `Executes ${language.toUpperCase()} logic with linear/iterative state flow.`,
        step_by_step: breakdown,
        concepts: [language.toUpperCase() + ' Syntax', 'Control Flow', 'Algorithmic Invariants'],
        data_structures: ['Primitive Variables'],
        algorithm: isLooping ? 'Iterative Scan' : 'Sequential Execution',
        time_complexity: timeComplexity,
        space_complexity: spaceComplexity,
        learning_tip: 'Always verify edge cases and boundary conditions before deploying.'
      },
      sourceCode: rawCode,
      language,
      mode,
      deterministicChecks: deterministic
    });

    return {
      ...normalizedResult,
      summary: normalizedResult.explanation,
      explanation: normalizedResult.explanation,
      bugs: (normalizedResult.errors || []).map(e => ({
        ...e,
        rootCause: e.root_cause,
        whyFixWorks: e.why_fix_works,
        preventionTip: e.prevention_tip
      })),
      errors: normalizedResult.errors,
      fixed_code: normalizedResult.fixed_code,
      fixedFullCode: normalizedResult.fixed_code,
      correctedFullCode: normalizedResult.fixed_code,
      algorithmicApproach: normalizedResult.algorithm,
      dataStructures: normalizedResult.data_structures,
      breakdown: normalizedResult.step_by_step,
      complexity: {
        time: timeComplexity,
        space: spaceComplexity
      },
      keyTakeaways: [
        'Keep functions pure and minimize side effects.',
        'Validate parameter contracts defensively.'
      ]
    };
  }

  /**
   * Unified dispatcher to Ollama local runtime with caching and fallback
   */
  static async analyzeCode(promptBundle, options = {}) {
    return OllamaService.generate(promptBundle, options);
  }
}
