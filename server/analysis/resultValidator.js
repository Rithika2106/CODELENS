/**
 * Result Validator & Line Verifier for CodeLens
 * Validates AI JSON output, verifies and clamps line numbers against actual source code,
 * handles JSON recovery, and cross-references deterministic static check findings.
 */

/**
 * Extract and parse JSON from potentially malformed or markdown-wrapped LLM text
 */
export function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid AI response string.');
  }

  const cleaned = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue to recovery strategies
  }

  // Strategy 1: Extract markdown fenced json ```json ... ```
  const jsonFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonFenceMatch && jsonFenceMatch[1]) {
    try {
      return JSON.parse(jsonFenceMatch[1].trim());
    } catch (e) {
      // Continue to next strategy
    }
  }

  // Strategy 2: Extract between first '{' and last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Try fixing trailing commas before closing braces/brackets
      const fixedCommas = candidate
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u201C\u201D]/g, '"') // smart double quotes
        .replace(/[\u2018\u2019]/g, "'"); // smart single quotes
      try {
        return JSON.parse(fixedCommas);
      } catch (e2) {
        // Continue
      }
    }
  }

  throw new Error(`Failed to parse structured JSON from AI output: ${rawText.slice(0, 120)}...`);
}

/**
 * Line and snippet verification against submitted source code
 */
export function verifyLineAndSnippet(errorItem, sourceLines) {
  const totalLines = sourceLines.length;
  let line = errorItem.line;
  const snippet = (errorItem.snippet || '').trim();

  // If line is not a valid number
  if (typeof line !== 'number' || isNaN(line)) {
    line = null;
  }

  let verified = false;

  // 1. Check if the specified line contains the snippet
  if (line !== null && line >= 1 && line <= totalLines) {
    const actualLineContent = sourceLines[line - 1].trim();
    if (snippet && (actualLineContent.includes(snippet) || snippet.includes(actualLineContent))) {
      verified = true;
      return {
        ...errorItem,
        line,
        snippet: actualLineContent || snippet,
        verified: true
      };
    }
  }

  // 2. If line number didn't match snippet, search entire source code for snippet
  if (snippet && snippet.length > 2) {
    for (let i = 0; i < totalLines; i++) {
      const lineContent = sourceLines[i].trim();
      if (lineContent.includes(snippet) || (lineContent.length > 3 && snippet.includes(lineContent))) {
        return {
          ...errorItem,
          line: i + 1,
          snippet: lineContent,
          verified: true
        };
      }
    }
  }

  // 3. If line exists within range but snippet couldn't be strictly verified
  if (line !== null && line >= 1 && line <= totalLines) {
    return {
      ...errorItem,
      line,
      snippet: sourceLines[line - 1].trim() || snippet,
      verified: false // Mark as AI-suspected/unverified
    };
  }

  // 4. Invalid line out of range and snippet not found -> clamp / nullify line to avoid bogus highlights
  return {
    ...errorItem,
    line: null,
    snippet: snippet || '',
    verified: false
  };
}

/**
 * Normalize and validate complete analysis result against code, mode, and deterministic checks
 */
export function validateAndNormalizeResult({
  rawOutput,
  sourceCode,
  language = 'python',
  mode = 'debug',
  deterministicChecks = { passed: true, findings: [] }
}) {
  const sourceLines = (sourceCode || '').split('\n');
  let parsed = null;

  try {
    parsed = typeof rawOutput === 'object' && rawOutput !== null
      ? rawOutput
      : extractAndParseJSON(rawOutput);
  } catch (err) {
    // If AI failed to output valid JSON, build a safe fallback using deterministic check findings
    const hasDeterministicErrors = deterministicChecks.findings.some(f => f.severity === 'error');
    return {
      status: hasDeterministicErrors ? 'BUGGY' : 'UNCERTAIN',
      errors: deterministicChecks.findings.map(f => verifyLineAndSnippet(f, sourceLines)),
      fixed_code: sourceCode,
      explanation: hasDeterministicErrors
        ? 'Deterministic static analysis detected syntax/semantic issues in the code.'
        : 'AI analysis could not complete structured formatting. Basic static checks found no obvious syntax errors.',
      learning_tip: 'Always verify syntax and static assertions before executing code.',
      meta: {
        isFallback: true,
        deterministicErrors: hasDeterministicErrors
      }
    };
  }

  // Normalize status: BUGGY | CORRECT | UNCERTAIN
  let status = (parsed.status || '').toUpperCase().trim();
  if (!['BUGGY', 'CORRECT', 'UNCERTAIN'].includes(status)) {
    if (parsed.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
      status = 'BUGGY';
    } else {
      status = 'CORRECT';
    }
  }

  // Process and verify errors list
  let errors = Array.isArray(parsed.errors) ? parsed.errors : [];

  // Merge confirmed deterministic errors if AI missed them
  if (deterministicChecks.findings && deterministicChecks.findings.length > 0) {
    for (const detFinding of deterministicChecks.findings) {
      const alreadyReported = errors.some(e => e.line === detFinding.line || e.title === detFinding.title);
      if (!alreadyReported) {
        errors.unshift(detFinding);
      }
    }
    if (deterministicChecks.findings.some(f => f.severity === 'error')) {
      status = 'BUGGY';
    }
  }

  // Verify and clamp line numbers for all error items
  errors = errors.map(err => verifyLineAndSnippet(err, sourceLines));

  // If status is CORRECT, enforce that errors list is empty and state "No obvious errors detected"
  if (status === 'CORRECT' && errors.length === 0) {
    let explanation = parsed.explanation || '';
    if (!explanation.toLowerCase().includes('no obvious error') && !explanation.toLowerCase().includes('correct')) {
      explanation = `No obvious errors detected. ${explanation}`.trim();
    }
    parsed.explanation = explanation;
    errors = [];
  } else if (errors.length > 0 && status === 'CORRECT') {
    // Inconsistency: AI reported errors but marked CORRECT -> rectify to BUGGY
    status = 'BUGGY';
  }

  // Construct verified final response object adhering to schema
  const normalized = {
    status,
    errors: status === 'CORRECT' ? [] : errors,
    fixed_code: parsed.fixed_code
      || deterministicChecks.findings?.find(finding => finding.corrected_code)?.corrected_code
      || (status === 'CORRECT' ? sourceCode : ''),
    explanation: parsed.explanation || (status === 'CORRECT' ? 'No obvious errors detected.' : 'Code analysis complete.'),
    learning_tip: parsed.learning_tip || 'Verify logic boundaries and test edge cases.',
    // Explain mode fields
    purpose: parsed.purpose || null,
    detected_issue: parsed.detected_issue || (status === 'BUGGY' && errors.length > 0 ? errors[0].problem : null),
    step_by_step: Array.isArray(parsed.step_by_step) ? parsed.step_by_step : null,
    concepts: Array.isArray(parsed.concepts) ? parsed.concepts : null,
    data_structures: Array.isArray(parsed.data_structures) ? parsed.data_structures : null,
    algorithm: parsed.algorithm || null,
    time_complexity: parsed.time_complexity || null,
    space_complexity: parsed.space_complexity || null,
    // Optimize mode fields
    optimization: parsed.optimization || null,
    meta: {
      totalLines: sourceLines.length,
      language,
      mode,
      verifiedAt: new Date().toISOString()
    }
  };

  return normalized;
}
