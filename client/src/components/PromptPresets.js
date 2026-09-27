export const NAIVE_VS_ENGINEERED_PRESETS = [
  {
    id: 'async-race-js',
    name: 'JS: Async forEach Race Condition',
    language: 'javascript',
    code: `async function fetchAllUsers(userIds) {\n  let results = [];\n  userIds.forEach(async (id) => {\n    const user = await api.getUser(id);\n    results.push(user);\n  });\n  return results;\n}`,
    naivePrompt: `Explain this code and fix any bugs:\n\nasync function fetchAllUsers(userIds) {\n  let results = [];\n  userIds.forEach(async (id) => {\n    const user = await api.getUser(id);\n    results.push(user);\n  });\n  return results;\n}`,
    description: 'Compares how a naive prompt yields a generic superficial answer vs how our structured CoT Few-Shot prompt catches the silent Array.prototype.forEach async pitfall and provides Promise.all refactor.'
  },
  {
    id: 'binary-search-overflow',
    name: 'C++: Binary Search Midpoint Overflow',
    language: 'cpp',
    code: `int binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int mid = (l + r) / 2;\n        if (arr[mid] == x) return mid;\n        if (arr[mid] < x) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}`,
    naivePrompt: `What does this code do and is it correct?\n\nint binarySearch(int arr[], int l, int r, int x) ...`,
    description: 'Demonstrates the subtle (l + r) / 2 integer overflow bug in C++/Java and how domain-specific context prompts immediately isolate and remedy it.'
  },
  {
    id: 'python-mutable-default',
    name: 'Python: Mutable Default Argument Trap',
    language: 'python',
    code: `def append_to_list(value, target_list=[]):\n    target_list.append(value)\n    return target_list\n\nprint(append_to_list(1))\nprint(append_to_list(2))`,
    naivePrompt: `Explain this python code: def append_to_list...`,
    description: 'Shows how role-based persona and language context prompt immediately reveals Python function object default evaluation mechanics.'
  }
];
