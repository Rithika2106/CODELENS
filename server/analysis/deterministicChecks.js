/**
 * Deterministic Static Checking Layer for CodeLens
 * Performs fast, rule-based static syntax & structure checks before LLM invocation.
 * Does NOT pretend to be a full compiler, but reliably catches obvious syntax errors,
 * unbalanced brackets, undefined identifiers in simple contexts, and language anti-patterns.
 */

const PYTHON_BUILTINS = new Set([
  'abs', 'aiter', 'all', 'anext', 'any', 'ascii', 'bin', 'bool', 'breakpoint',
  'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex',
  'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter',
  'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash',
  'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter',
  'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
  'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed',
  'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum',
  'super', 'tuple', 'type', 'vars', 'zip', 'True', 'False', 'None', 'self', 'cls',
  'Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError', 'AttributeError',
  'FileNotFoundError', 'ZeroDivisionError', 'ImportError', 'StopIteration'
]);

const JS_BUILTINS = new Set([
  'console', 'window', 'document', 'globalThis', 'process', 'Math', 'JSON',
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Map',
  'Set', 'Promise', 'Error', 'TypeError', 'RangeError', 'SyntaxError',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI',
  'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'fetch', 'undefined', 'null', 'NaN', 'Infinity',
  'Symbol', 'BigInt', 'ArrayBuffer', 'Uint8Array', 'Int32Array'
]);

/**
 * Check for bracket, brace, and parenthesis balance
 */
export function checkBracketBalance(code, language) {
  const findings = [];
  const stack = [];
  const lines = code.split('\n');
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const closing = new Set([')', ']', '}']);

  let inString = false;
  let stringChar = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = lineIdx + 1;
    inLineComment = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const nextChar = line[charIdx + 1];

      // Handle Python comments
      if (language === 'python' && char === '#' && !inString) {
        inLineComment = true;
        break;
      }

      // Handle JS / C / C++ / Java line comments
      if (['javascript', 'c', 'cpp', 'java'].includes(language) && char === '/' && nextChar === '/' && !inString && !inBlockComment) {
        inLineComment = true;
        break;
      }

      // Handle SQL line comments
      if (language === 'sql' && char === '-' && nextChar === '-' && !inString) {
        inLineComment = true;
        break;
      }

      // Handle C / C++ / Java block comments
      if (['javascript', 'c', 'cpp', 'java', 'sql'].includes(language) && char === '/' && nextChar === '*' && !inString) {
        inBlockComment = true;
        charIdx++;
        continue;
      }
      if (inBlockComment && char === '*' && nextChar === '/') {
        inBlockComment = false;
        charIdx++;
        continue;
      }
      if (inBlockComment || inLineComment) continue;

      // Handle quotes (single, double, backtick)
      if ((char === '"' || char === "'" || char === '`') && (charIdx === 0 || line[charIdx - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
          stringChar = null;
        }
        continue;
      }

      if (inString) continue;

      // Check opening brackets
      if (pairs[char]) {
        stack.push({ char, line: lineNum, col: charIdx + 1, expected: pairs[char] });
      } else if (closing.has(char)) {
        if (stack.length === 0) {
          findings.push({
            severity: 'error',
            line: lineNum,
            snippet: line.trim(),
            verified: true,
            title: `Unmatched closing bracket '${char}'`,
            problem: `Encountered a closing '${char}' without a matching opening bracket.`,
            root_cause: `The bracket was closed without ever being opened or the opening bracket was deleted.`,
            what_it_is_trying_to_do: 'Close a code block or expression.',
            what_happens: 'Causes a syntax error during parsing/compilation.',
            fix: `Remove the extra '${char}' or add the matching opening bracket.`,
            why_fix_works: 'Restores balanced syntax hierarchy.',
            prevention_tip: 'Use an editor with bracket pair colorization and auto-closing enabled.'
          });
        } else {
          const top = stack.pop();
          if (top.expected !== char) {
            findings.push({
              severity: 'error',
              line: lineNum,
              snippet: line.trim(),
              verified: true,
              title: `Mismatched bracket: expected '${top.expected}', found '${char}'`,
              problem: `Bracket opened as '${top.char}' on line ${top.line} but closed with '${char}' on line ${lineNum}.`,
              root_cause: `Mismatched bracket pair characters.`,
              what_it_is_trying_to_do: `Close the expression opened with '${top.char}'.`,
              what_happens: 'Syntax error prevents parsing or execution.',
              fix: `Replace '${char}' with '${top.expected}'.`,
              why_fix_works: 'Correctly matches the opening bracket type.',
              prevention_tip: 'Check that parentheses (), brackets [], and braces {} are properly paired.'
            });
          }
        }
      }
    }
  }

  // Check unclosed brackets remaining on stack
  while (stack.length > 0) {
    const unclosed = stack.pop();
    findings.push({
      severity: 'error',
      line: unclosed.line,
      snippet: lines[unclosed.line - 1] ? lines[unclosed.line - 1].trim() : '',
      verified: true,
      title: `Unclosed bracket '${unclosed.char}'`,
      problem: `Opening bracket '${unclosed.char}' on line ${unclosed.line} is never closed.`,
      root_cause: `Missing matching '${unclosed.expected}'.`,
      what_it_is_trying_to_do: `Open a block or grouped expression.`,
      what_happens: 'Syntax error — unexpected EOF (end of file) or block mismatch.',
      fix: `Add closing '${unclosed.expected}' at the appropriate end of block or expression.`,
      why_fix_works: 'Completes the open syntactic structure.',
      prevention_tip: 'Always ensure blocks opened with {} or () are closed properly.'
    });
  }

  return findings;
}

/**
 * Deterministic Python checks (missing colons, undefined variables in simple scripts, mutable defaults)
 */
export function checkPython(code) {
  const findings = [];
  const lines = code.split('\n');

  // 1. Missing Colon Check
  const blockKeywords = /^\s*(if|elif|else|for|while|def|class|try|except|finally|with|async\s+def|async\s+for|async\s+with)\b/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check if line starts with a block keyword
    if (blockKeywords.test(trimmed)) {
      // Remove trailing comments before checking colon
      const codePart = trimmed.split('#')[0].trim();
      
      // If single-line like "if x > 5 print(x)" or "if x > 5\n" without ':'
      if (!codePart.endsWith(':')) {
        // Special case: check if it has a colon in the middle e.g. "if x > 5: print(x)"
        // If no colon anywhere in the statement structure:
        const hasColon = /:\s*(.*)$/.test(codePart);
        if (!hasColon) {
          findings.push({
            severity: 'error',
            line: lineNum,
            snippet: trimmed,
            verified: true,
            title: 'Syntax error: missing colon',
            problem: `Missing colon (':') at the end of '${trimmed.split(/\s+/)[0]}' statement.`,
            root_cause: `In Python, compound statements (if, for, while, def, class, etc.) must terminate header lines with a colon ':'.`,
            what_it_is_trying_to_do: 'Define a conditional or block header.',
            what_happens: 'Python raises a SyntaxError: expected \':\' before running.',
            fix: `${trimmed}:`,
            why_fix_works: 'Adds the required colon to signify the beginning of the indented suite.',
            prevention_tip: 'Remember that every header statement in Python (if, else, for, while, def, class) must end with a colon.'
          });
        }
      }
    }

    // 2. Mutable default argument check
    const defMatch = trimmed.match(/def\s+([a-zA-Z_]\w*)\s*\((.*?)\):?/);
    if (defMatch) {
      const params = defMatch[2];
      if (/=\s*(\[\]|\{\})/.test(params)) {
        findings.push({
          severity: 'warning',
          line: lineNum,
          snippet: trimmed,
          verified: true,
          title: 'Dangerous mutable default argument',
          problem: `Function '${defMatch[1]}' uses a mutable default argument ([] or {}).`,
          root_cause: `Default argument expressions in Python are evaluated once at function definition time, so the same list/dict is shared across calls.`,
          what_it_is_trying_to_do: 'Provide a default empty container for the parameter.',
          what_happens: 'Mutating the default object in one function call will persist and leak into subsequent calls.',
          fix: `Use 'None' as default and initialize inside: 'def ${defMatch[1]}(param=None): if param is None: param = []'`,
          why_fix_works: 'Ensures a brand-new container is created on every invocation where the argument is omitted.',
          prevention_tip: 'Never use mutable literals ([], {}, set()) as default parameter values in Python. Use None instead.'
        });
      }
    }
  }

  // 3. Simple Undefined Variable Heuristic for Python
  // Check standalone scripts for variables used before assignment
  const assignedVars = new Set();
  // Extract imports and function definitions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Detect assignments: x = 10 or x, y = 1, 2
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*(=|\+=|-=|\*=|\/=|:=)/);
    if (assignMatch) {
      const vars = assignMatch[1].split(',').map(v => v.trim());
      vars.forEach(v => assignedVars.add(v));
    }

    // Detect for loops: for x in ...
    const forMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\b/);
    if (forMatch) {
      assignedVars.add(forMatch[1]);
    }

    // Detect function definitions and parameters
    const funcMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\((.*?)\)/);
    if (funcMatch) {
      assignedVars.add(funcMatch[1]);
      funcMatch[2].split(',').forEach(p => {
        const pName = p.split('=')[0].split(':')[0].trim();
        if (pName) assignedVars.add(pName);
      });
    }

    // Detect imports
    const importMatch = trimmed.match(/^(?:import\s+([a-zA-Z_]\w*)|from\s+\w+\s+import\s+([a-zA-Z_]\w*))/);
    if (importMatch) {
      if (importMatch[1]) assignedVars.add(importMatch[1]);
      if (importMatch[2]) assignedVars.add(importMatch[2]);
    }

    // Check usages in simple expressions like print(y) or y + 1
    // Look for print(var) or direct reference
    const printMatch = trimmed.match(/print\s*\(\s*([a-zA-Z_]\w*)\s*\)/);
    if (printMatch) {
      const varName = printMatch[1];
      if (!assignedVars.has(varName) && !PYTHON_BUILTINS.has(varName)) {
        findings.push({
          severity: 'error',
          line: lineNum,
          snippet: trimmed,
          verified: true,
          title: `Undefined variable '${varName}'`,
          problem: `Variable '${varName}' is referenced in print() before being defined or assigned.`,
          root_cause: `The identifier '${varName}' is not bound to any value in the local or global scope.`,
          what_it_is_trying_to_do: `Output the value of variable '${varName}'.`,
          what_happens: `Raises NameError: name '${varName}' is not defined at runtime.`,
          fix: `Define '${varName}' before using it (e.g. '${varName} = ...') or correct the variable name.`,
          why_fix_works: 'Binds the identifier to a valid object in memory before access.',
          prevention_tip: 'Ensure all variables are declared and initialized before they are read.'
        });
      }
    }
  }

  return findings;
}

/**
 * Deterministic JavaScript checks
 */
export function checkJavaScript(code) {
  const findings = [];
  const lines = code.split('\n');

  // Check simple undeclared variable in function: function greet(name) { console.log(message); }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Check console.log(var) where var is not a string literal or known builtin
    const consoleMatch = trimmed.match(/console\.(?:log|warn|error|info)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/);
    if (consoleMatch) {
      const varName = consoleMatch[1];
      if (!JS_BUILTINS.has(varName)) {
        // Check if declared in code
        const declRegex = new RegExp(`\\b(let|const|var|function|class)\\s+${varName}\\b|\\bfunction\\s*\\w*\\s*\\([^)]*\\b${varName}\\b|\\((?:[^)]*,\\s*)?${varName}(?:\\s*,[^)]*)?\\)\\s*=>`);
        if (!declRegex.test(code)) {
          findings.push({
            severity: 'error',
            line: lineNum,
            snippet: trimmed,
            verified: true,
            title: `Undefined variable '${varName}'`,
            problem: `Variable '${varName}' is referenced without being declared in the current scope.`,
            root_cause: `'${varName}' is not declared with const, let, var, or passed as a parameter.`,
            what_it_is_trying_to_do: `Log the value of '${varName}'.`,
            what_happens: `Throws ReferenceError: ${varName} is not defined at runtime.`,
            fix: `Declare and initialize '${varName}' (e.g., 'const ${varName} = "...";') before logging it.`,
            why_fix_works: 'Declares the variable in the lexical scope before runtime evaluation.',
            prevention_tip: 'Always declare variables with const or let, or verify function parameters.'
          });
        }
      }
    }

    // Check for accidental assignment in condition: if (x = 5)
    const assignInIf = trimmed.match(/^if\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^=]/);
    if (assignInIf) {
      findings.push({
        severity: 'warning',
        line: lineNum,
        snippet: trimmed,
        verified: true,
        title: 'Assignment in conditional expression',
        problem: `Using single '=' assignment operator inside an if condition.`,
        root_cause: `Accidental assignment instead of comparison ('===' or '==').`,
        what_it_is_trying_to_do: 'Test for equality.',
        what_happens: 'Assigns value and evaluates truthiness of the assigned value, often leading to unexpected logic branch.',
        fix: trimmed.replace(/=\s*([^=])/, '=== $1'),
        why_fix_works: 'Uses strict equality comparison rather than assignment.',
        prevention_tip: 'Use strict equality (===) for comparisons in JavaScript.'
      });
    }
  }

  return findings;
}

/**
 * Deterministic SQL checks (e.g. '= NULL' instead of 'IS NULL')
 */
export function checkSQL(code) {
  const findings = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Check for '= NULL' or '!= NULL' or '<> NULL'
    const nullCompMatch = trimmed.match(/(\b\w+\b)\s*(=|!=|<>)\s*NULL\b/i);
    if (nullCompMatch) {
      const col = nullCompMatch[1];
      const op = nullCompMatch[2];
      const isNegated = op === '!=' || op === '<>';
      const correctOp = isNegated ? 'IS NOT NULL' : 'IS NULL';

      findings.push({
        severity: 'error',
        line: lineNum,
        snippet: trimmed,
        verified: true,
        title: `Invalid NULL comparison '${nullCompMatch[0]}'`,
        problem: `Comparing a column to NULL using '${op} NULL' instead of '${correctOp}'.`,
        root_cause: `In SQL three-valued logic, comparison with NULL using '=' or '!=' always evaluates to UNKNOWN, never TRUE. As a result, '${col} = NULL' will never match any rows!`,
        what_it_is_trying_to_do: `Filter rows where '${col}' is ${isNegated ? 'not null' : 'null'}.`,
        what_happens: 'The query returns 0 rows (empty result set) because condition evaluates to UNKNOWN for all records.',
        fix: trimmed.replace(new RegExp(`${col}\\s*(=|!=|<>)\\s*NULL`, 'i'), `${col} ${correctOp}`),
        why_fix_works: `'${correctOp}' is the standard ANSI SQL predicate specifically designed to test for NULL values.`,
        prevention_tip: 'Always use IS NULL or IS NOT NULL when checking for missing or null values in SQL.'
      });
    }
  }

  return findings;
}

/**
 * Deterministic C / C++ checks
 */
export function checkCpp(code) {
  const findings = [];
  const lines = code.split('\n');

  // Check missing semicolon on simple statements (return, printf, var declarations)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) continue;

    // Statements that must end with semicolon
    const isStatement = /^(return\b|int\s+\w+|char\s+\w+|float\s+\w+|double\s+\w+|printf\s*\(|cout\s*<<)/.test(trimmed);
    const endsWithValid = trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.endsWith(',');

    if (isStatement && !endsWithValid) {
      // Check if next line starts with continuation
      const nextLine = (lines[i + 1] || '').trim();
      if (!nextLine.startsWith('<<') && !nextLine.startsWith('+') && !nextLine.startsWith('.')) {
        findings.push({
          severity: 'error',
          line: lineNum,
          snippet: trimmed,
          verified: true,
          title: 'Missing semicolon',
          problem: `Statement is missing a trailing semicolon ';'.`,
          root_cause: `C and C++ require statements to end with a semicolon delimiter.`,
          what_it_is_trying_to_do: 'Execute a statement.',
          what_happens: 'Causes compilation error: expected \';\' before ...',
          fix: `${trimmed};`,
          why_fix_works: 'Adds the required semicolon statement terminator.',
          prevention_tip: 'Ensure every statement in C/C++ ends with a semicolon.'
        });
      }
    }
  }

  return findings;
}

/**
 * Deterministic Java checks
 */
export function checkJava(code) {
  const findings = [];
  const lines = code.split('\n');
  const integerValues = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    const analysisLine = trimmed
      .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""')
      .split('//')[0]
      .replace(/\/\*.*?\*\//g, '');

    const declarationPattern = /\b(?:byte|short|int|long)\s+([A-Za-z_$][\w$]*)\s*=\s*([+-]?\d+)\b/g;
    let declarationMatch;
    while ((declarationMatch = declarationPattern.exec(analysisLine)) !== null) {
      integerValues.set(declarationMatch[1], Number(declarationMatch[2]));
    }

    const assignmentPattern = /\b([A-Za-z_$][\w$]*)\s*=(?!=)\s*([^;,\s]+)/g;
    let assignmentMatch;
    while ((assignmentMatch = assignmentPattern.exec(analysisLine)) !== null) {
      if (integerValues.has(assignmentMatch[1])) {
        const assignedValue = assignmentMatch[2].match(/^[+-]?\d+$/);
        integerValues.set(assignmentMatch[1], assignedValue ? Number(assignedValue[0]) : null);
      }
    }

    const divisorPattern = /([/%])\s*(0+[lL]?(?![\w.])|0[xX]0+[lL]?(?![\w.])|[A-Za-z_$][\w$]*)\b/g;
    let divisorMatch;
    while ((divisorMatch = divisorPattern.exec(analysisLine)) !== null) {
      const divisor = divisorMatch[2];
      const directZero = /^0+[lL]?$/i.test(divisor) || /^0[xX]0+[lL]?$/i.test(divisor);
      const knownZero = integerValues.get(divisor) === 0;
      if (!directZero && !knownZero) continue;

      const operation = divisorMatch[1] === '/' ? 'division' : 'modulo';
      const rootCause = directZero
        ? `The integer ${operation} uses the literal zero as its divisor.`
        : `Variable '${divisor}' is initialized or assigned to 0 and is used as the divisor.`;
      const correctedLines = [...lines];
      const indentation = line.match(/^\s*/)?.[0] || '';
      let correction;

      if (directZero) {
        const safeName = `codeLensDivisor${lineNum}`;
        const divisorOffset = divisorMatch.index + divisorMatch[0].lastIndexOf(divisor);
        correctedLines[i] = `${line.slice(0, divisorOffset)}${safeName}${line.slice(divisorOffset + divisor.length)}`;
        correctedLines.splice(i, 0,
          `${indentation}int ${safeName} = 0;`,
          `${indentation}if (${safeName} == 0) { throw new IllegalArgumentException("Divisor must not be zero"); }`
        );
        correction = `Replace the literal zero with the intended non-zero value, or validate a divisor before this operation. A guarded example has been added to the corrected code.`;
      } else {
        correctedLines.splice(i, 0,
          `${indentation}if (${divisor} == 0) { throw new IllegalArgumentException("Divisor must not be zero"); }`
        );
        correction = `Check '${divisor}' before this operation and handle the zero case; the corrected code adds a guard that throws a clear exception.`;
      }

      findings.push({
        severity: 'error',
        line: lineNum,
        snippet: trimmed,
        verified: true,
        title: `Runtime / Logic Error: Java ${operation} by zero`,
        category: 'Runtime / Logic Error',
        problem: `This integer ${operation} uses a divisor that is deterministically zero.`,
        root_cause: rootCause,
        what_it_is_trying_to_do: `Evaluate an integer ${operation} expression.`,
        what_happens: "Java throws ArithmeticException: / by zero at runtime.",
        fix: correction,
        corrected_code: correctedLines.join('\n'),
        why_fix_works: 'The guard detects zero before the arithmetic operation and stops with an explicit, actionable exception instead of allowing ArithmeticException: / by zero.',
        prevention_tip: 'Validate integer divisors before using / or %, and add tests for zero-valued inputs.'
      });
    }

    const isStatement = /^(return\b|System\.out\.print|int\s+\w+|String\s+\w+|double\s+\w+|boolean\s+\w+)/.test(trimmed);
    const endsWithValid = trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}');

    if (isStatement && !endsWithValid) {
      findings.push({
        severity: 'error',
        line: lineNum,
        snippet: trimmed,
        verified: true,
        title: 'Missing semicolon',
        problem: `Java statement is missing a trailing semicolon ';'.`,
        root_cause: `Java requires every statement to terminate with a semicolon.`,
        what_it_is_trying_to_do: 'Execute a Java statement.',
        what_happens: 'Compilation error: \';\' expected.',
        fix: `${trimmed};`,
        why_fix_works: 'Terminates the Java statement.',
        prevention_tip: 'Always terminate Java statements with a semicolon.'
      });
    }
  }

  return findings;
}

/**
 * Master deterministic static check dispatcher
 */
export function runDeterministicChecks(code, language = 'python') {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return { passed: true, findings: [] };
  }

  const normalizedLang = (language || '').toLowerCase().trim();
  const findings = [];

  // 1. General bracket matching for all languages
  const bracketFindings = checkBracketBalance(code, normalizedLang);
  findings.push(...bracketFindings);

  // 2. Language-specific checks
  switch (normalizedLang) {
    case 'python':
      findings.push(...checkPython(code));
      break;
    case 'javascript':
    case 'js':
      findings.push(...checkJavaScript(code));
      break;
    case 'sql':
      findings.push(...checkSQL(code));
      break;
    case 'c':
    case 'cpp':
    case 'c++':
      findings.push(...checkCpp(code));
      break;
    case 'java':
      findings.push(...checkJava(code));
      break;
    default:
      break;
  }

  return {
    passed: findings.length === 0,
    findings,
    hasDeterministicErrors: findings.some(f => f.severity === 'error')
  };
}
