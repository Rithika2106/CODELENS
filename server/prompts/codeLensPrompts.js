import { createSecureCodePayload } from '../security/sanitizer.js';

export const SUPPORTED_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'bash'
];

export class CodeLensPrompts {
  /**
   * Generates tailored prompts for Explain, Debug, and Optimize modes
   */
  static buildPrompt(params) {
    const {
      code,
      language = 'python',
      mode = 'explain', // 'explain' | 'debug' | 'optimize'
      level = 'intermediate'
    } = params;

    const securePayload = createSecureCodePayload(code);

    const systemPrompt = `You are CodeLens AI — an expert, local, self-contained AI Code Explainer and Debugger.
You provide precise, structured, high-quality technical analysis for ${language.toUpperCase()} source code.
You MUST output your response strictly as valid JSON adhering to the specified schema with NO markdown code block wrappers around the JSON.`;

    let userPrompt = '';

    if (mode === 'explain') {
      userPrompt = `
Analyze and explain the following ${language} code for a ${level} level developer:

### STRICT OUTPUT JSON FORMAT:
{
  "summary": "Clear, beginner-friendly executive explanation of what the code does overall.",
  "algorithmicApproach": "High-level algorithmic strategy (e.g. Two-Pointers, Divide-and-Conquer, Dynamic Programming, Linear Scan, Event Loop Async).",
  "dataStructures": ["List of data structures utilized, e.g. Hash Map, Binary Tree, Array, Heap"],
  "breakdown": [
    {
      "startLine": 1,
      "endLine": 3,
      "code": "corresponding code snippet",
      "explanation": "Clear explanation of this logic section tailored to ${level} level."
    }
  ],
  "complexity": {
    "time": "O(...) with asymptotic explanation",
    "space": "O(...) with memory allocation explanation",
    "bottlenecks": "Any performance or memory bottlenecks."
  },
  "keyTakeaways": [
    "Key best practice or principle 1",
    "Key best practice or principle 2"
  ]
}

### CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    } else if (mode === 'debug') {
      userPrompt = `
Perform a thorough bug detection and diagnosis scan on the following ${language} code.
Scan for syntax errors, logical flaws, potential runtime exceptions, security vulnerabilities (e.g. injection, buffer overflows, race conditions), and common language-specific anti-patterns.

### STRICT OUTPUT JSON FORMAT:
{
  "summary": "Executive summary of code health and diagnostic findings.",
  "bugs": [
    {
      "id": "BUG-1",
      "severity": "critical | warning | suggestion",
      "title": "Concise bug title",
      "line": 4,
      "category": "Syntax Error | Logic Flaw | Runtime Exception | Security Vulnerability | Performance Anti-pattern",
      "rootCause": "Deep explanation of WHY the bug occurs, including the underlying conceptual misunderstanding or language-specific behavior responsible.",
      "fixDiff": {
        "original": "buggy code lines",
        "proposed": "corrected code lines"
      },
      "explanation": "How the proposed fix resolves the issue."
    }
  ],
  "correctedFullCode": "The fully corrected, complete version of the code with clear inline comments marking what changed and why.",
  "complexity": {
    "time": "O(...)",
    "space": "O(...)",
    "details": "Complexity after bug resolutions."
  }
}

### CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    } else if (mode === 'optimize') {
      userPrompt = `
Generate an optimized, production-grade refactor of the following ${language} code.
Focus on:
1. Algorithmic efficiency (reducing Big-O time complexity)
2. Readability and maintainability
3. Idiomatic patterns and modern features for ${language}
4. Memory usage reduction

### STRICT OUTPUT JSON FORMAT:
{
  "summary": "Executive summary of optimization improvements.",
  "improvements": [
    {
      "area": "Algorithmic Efficiency | Memory Usage | Readability & Idioms | Modern Language Features",
      "description": "What was improved and the quantitative or qualitative benefit."
    }
  ],
  "originalCode": "original code snippet",
  "optimizedFullCode": "complete, optimized, production-ready code",
  "diff": {
    "before": "key unoptimized section",
    "after": "optimized replacement section",
    "rationale": "why this refactor is superior"
  },
  "complexityComparison": {
    "before": { "time": "O(...)", "space": "O(...)" },
    "after": { "time": "O(...)", "space": "O(...)" },
    "details": "Explanation of complexity gain."
  }
}

### CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    }

    return {
      systemPrompt,
      userPrompt,
      securePayload,
      mode,
      language,
      level
    };
  }
}
