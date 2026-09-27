export const ROLE_PERSONAS = {
  tutor: {
    id: 'tutor',
    name: 'CS Educator / Tutor',
    description: 'Pedagogical, encouraging, and focused on building fundamental mental models and clean conceptual understanding.'
  },
  architect: {
    id: 'architect',
    name: 'Principal Systems Architect',
    description: 'Evaluates memory layout, concurrency safety, scale bottlenecks, and high-reliability production design.'
  },
  code_reviewer: {
    id: 'code_reviewer',
    name: 'Senior Code Reviewer',
    description: 'Focuses on maintainability, edge cases, error handling, defensive programming, and idiomatic style.'
  },
  professor: {
    id: 'professor',
    name: 'Algorithm Professor',
    description: 'Analyzes formal time and space complexity, proofs of correctness, and mathematical data structures.'
  }
};

export const LEVEL_GUIDELINES = {
  eli5: {
    id: 'eli5',
    name: 'ELI5 (Explain Like I am 5)',
    description: 'Uses intuitive everyday analogies and avoids heavy technical jargon.'
  },
  beginner: {
    id: 'beginner',
    name: 'Beginner',
    description: 'Explains programming terminology clearly and breaks down step-by-step logic.'
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Focuses on standard idioms, performance characteristics, and practical design patterns.'
  },
  expert: {
    id: 'expert',
    name: 'Senior / Staff Engineer',
    description: 'High-density technical precision examining compiler internals, memory allocation, and concurrency.'
  }
};

export const LANGUAGE_CONTEXT_HINTS = {
  python: 'Python 3.x execution model (GIL, reference counting, dynamic typing, list/dict mutability).',
  javascript: 'V8 Engine & JS Event loop (microtasks, macrotasks, prototypical inheritance, Promise concurrency).',
  typescript: 'Structural typing system, type narrowing, interfaces, generics, runtime erasure.',
  c: 'Manual memory management, pointer arithmetic, stack/heap boundaries, undefined behavior.',
  cpp: 'RAII, smart pointers, templates, move semantics, STL container complexity.',
  java: 'JVM garbage collection, class loading, object reference equality, concurrency primitives.',
  sql: 'RDBMS query planner, indexing strategies, three-valued logic (NULL handling), ACID transactions.',
  go: 'Goroutines, channels, CSP concurrency, escape analysis, interface dispatch.',
  rust: 'Ownership, borrow checker, lifetimes, zero-cost abstractions, memory safety without GC.'
};

export const NAIVE_VS_ENGINEERED_PRESETS = [
  {
    id: 'python-mutable-default',
    title: 'Python Mutable Default Argument',
    language: 'python',
    code: `def append_to_list(val, my_list=[]):\n    my_list.append(val)\n    return my_list\n\nprint(append_to_list(1))\nprint(append_to_list(2))`
  },
  {
    id: 'js-async-foreach',
    title: 'JavaScript Async forEach Gotcha',
    language: 'javascript',
    code: `async function fetchUsers(userIds) {\n    let results = [];\n    userIds.forEach(async (id) => {\n        const user = await api.getUser(id);\n        results.push(user);\n    });\n    return results;\n}`
  },
  {
    id: 'cpp-binary-search-overflow',
    title: 'C++ Midpoint Integer Overflow',
    language: 'cpp',
    code: `int binarySearch(int arr[], int n, int target) {\n    int l = 0, r = n - 1;\n    while (l <= r) {\n        int mid = (l + r) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}`
  },
  {
    id: 'sql-null-comparison',
    title: 'SQL = NULL Comparison Trap',
    language: 'sql',
    code: `SELECT user_id, username, email\nFROM accounts\nWHERE email = NULL;`
  }
];
