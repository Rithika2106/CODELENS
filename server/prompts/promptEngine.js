import { createSecureCodePayload } from '../security/sanitizer.js';
import { ROLE_PERSONAS, LEVEL_GUIDELINES, LANGUAGE_CONTEXT_HINTS } from './templates.js';
import { extractAndParseJSON } from '../analysis/resultValidator.js';

export class PromptEngine {
  /**
   * Safe parser for LLM JSON output with multiple recovery strategies
   */
  static parseLLMResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty response from LLM runtime.');
    }

    try {
      return extractAndParseJSON(rawText);
    } catch (e) {
      // Fallback parsing strategy
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          const candidate = rawText.slice(firstBrace, lastBrace + 1);
          return JSON.parse(candidate);
        } catch (e2) {
          // Continue
        }
      }
      throw new Error(`Failed to parse structured JSON: ${rawText.slice(0, 100)}...`);
    }
  }

  /**
   * Build engineered prompt bundle
   */
  static buildPrompt({
    code,
    language = 'python',
    level = 'intermediate',
    mode = 'debug', // 'debug' | 'explain' | 'optimize'
    strategy = 'combined',
    persona = 'tutor'
  }) {
    const securePayload = createSecureCodePayload(code);
    const personaData = ROLE_PERSONAS[persona] || ROLE_PERSONAS.tutor;
    const levelData = LEVEL_GUIDELINES[level] || LEVEL_GUIDELINES.intermediate;
    const langContext = LANGUAGE_CONTEXT_HINTS[language.toLowerCase()] || '';

    const systemPrompt = `You are CodeLens AI — an expert AI programming assistant, static analyzer, and educator acting as ${personaData.name}.
Target Audience Level: ${levelData.name} (${levelData.description}).
Language Runtime Context: ${langContext}

CRITICAL RULES:
1. NEVER invent errors in working code. If the code is correct, mark status as "CORRECT" and state "No obvious errors detected."
2. If code contains a bug or syntax error, mark status as "BUGGY", pinpoint line number and root cause, and provide corrected code.
3. If unsure, mark status as "UNCERTAIN".
4. Output STRICT JSON adhering to the specified schema with NO extraneous markdown text outside the JSON.`;

    let userPrompt = '';

    if (mode === 'debug') {
      userPrompt = `
Perform a reliable debugging diagnosis on the following ${language} code.

Output JSON Schema:
{
  "status": "BUGGY" | "CORRECT" | "UNCERTAIN",
  "summary": "Executive summary of diagnosis",
  "errors": [
    {
      "severity": "error" | "warning",
      "line": 2,
      "snippet": "exact line of code",
      "verified": true,
      "title": "Bug title",
      "what_it_is_trying_to_do": "Intent description",
      "problem": "Exact problem",
      "root_cause": "Underlying language runtime or syntax cause",
      "what_happens": "Runtime exception or broken output",
      "fix": "Specific fix",
      "why_fix_works": "Explanation of fix",
      "prevention_tip": "Advice to avoid this in the future"
    }
  ],
  "fixed_code": "Complete working corrected source code",
  "explanation": "Summary explanation",
  "learning_tip": "Key educational takeaway"
}

CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    } else if (mode === 'explain') {
      userPrompt = `
Explain the following ${language} code step-by-step for a ${level} audience.
If an obvious error exists, set status to "BUGGY", note it in "detected_issue", and explain why it fails. Otherwise set status to "CORRECT".

Output JSON Schema:
{
  "status": "CORRECT" | "BUGGY" | "UNCERTAIN",
  "detected_issue": null | "description of issue if present",
  "purpose": "High-level summary of what the code does",
  "step_by_step": [
    { "step": 1, "lines": "Lines 1-2", "title": "Action", "description": "Walkthrough description" }
  ],
  "concepts": ["Concept 1", "Concept 2"],
  "data_structures": ["Data Structure 1"],
  "algorithm": "Algorithm name or paradigm",
  "time_complexity": "O(...) Big-O time complexity",
  "space_complexity": "O(...) Big-O space complexity",
  "explanation": "Complete overview",
  "learning_tip": "Educational takeaway"
}

CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    } else if (mode === 'optimize') {
      userPrompt = `
Analyze performance, time/space complexity, and idiomatic clean code improvements for the following ${language} code.
Never claim an optimization improves performance unless there is a solid technical basis.

Output JSON Schema:
{
  "status": "CORRECT" | "BUGGY" | "UNCERTAIN",
  "optimization": {
    "original_time_complexity": "O(...)",
    "optimized_time_complexity": "O(...)",
    "original_space_complexity": "O(...)",
    "optimized_space_complexity": "O(...)",
    "unnecessary_operations": "Description of eliminated redundancies",
    "readability_improvements": "Idiomatic clean code improvements",
    "original_code": "Original source snippet",
    "optimized_code": "Complete optimized code",
    "changes_explanation": "Breakdown of refactoring",
    "expected_benefit": "Realistic performance / memory gain"
  },
  "explanation": "Overview summary",
  "learning_tip": "Key optimization principle"
}

CODE UNDER ANALYSIS:
${securePayload.boundedPayload}
`;
    }

    return {
      systemPrompt,
      userPrompt,
      securePayload,
      mode,
      language,
      level,
      strategy
    };
  }
}
