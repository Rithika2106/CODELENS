export const SAMPLE_SNIPPETS = [
  {
    id: 'py-mutable-default',
    name: 'Python: Mutable Default Argument',
    language: 'python',
    category: 'State & Scope',
    description: 'List default argument evaluates once at definition time, leaking state.',
    code: `# Python Mutable Default Argument Trap
def add_transaction(amount, ledger=[]):
    """Appends amount to ledger and computes running balance."""
    ledger.append(amount)
    total = sum(ledger)
    return {"ledger": ledger, "total": total}

# Calling this multiple times unexpectedly mutates the same list!
tx1 = add_transaction(100)
tx2 = add_transaction(250)
print(tx1, tx2)`
  },
  {
    id: 'js-async-race',
    name: 'JavaScript: Async forEach Loop Gotcha',
    language: 'javascript',
    category: 'Concurrency & Async',
    description: 'Array.forEach unawaited async callback causing race conditions.',
    code: `// Classic JavaScript Event Loop & Promise Gotcha
async function fetchUserData(userIds) {
  let userProfiles = [];
  
  // Bug: forEach ignores returned promises!
  userIds.forEach(async (id) => {
    const res = await api.getUser(id);
    userProfiles.push(res);
  });
  
  // Returns prematurely before async calls resolve
  return userProfiles;
}`
  },
  {
    id: 'ts-unsafe-any',
    name: 'TypeScript: Nullable Dereference & any Escape',
    language: 'typescript',
    category: 'Type Safety',
    description: 'Bypassing strict null checks leading to runtime TypeError.',
    code: `interface UserConfig {
  theme?: string;
  metadata?: { lastLogin?: Date };
}

function renderDashboard(config: any) {
  // Bug: Unsafe dereference without optional chaining or null narrowing
  const formattedDate = config.metadata.lastLogin.toISOString();
  console.log("Welcome back, last active:", formattedDate);
}`
  },
  {
    id: 'cpp-binary-search',
    name: 'C++: Binary Search Midpoint Overflow',
    language: 'cpp',
    category: 'Numeric Overflow',
    description: '(l + r) / 2 signed integer overflow on large arrays.',
    code: `#include <vector>

// Classic Binary Search implementation
int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;

    while (left <= right) {
        // Bug: (left + right) can overflow 32-bit INT_MAX
        int mid = (left + right) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
  },
  {
    id: 'c-buffer-overflow',
    name: 'C: Buffer Overflow with strcpy',
    language: 'c',
    category: 'Memory Safety',
    description: 'Unbounded strcpy writing beyond fixed stack allocation.',
    code: `#include <stdio.h>
#include <string.h>

void process_input(const char *user_str) {
    char buffer[16];
    // Security Bug: Unbounded copy leads to stack buffer overflow
    strcpy(buffer, user_str);
    printf("Buffer content: %s\\n", buffer);
}`
  },
  {
    id: 'csharp-async-void',
    name: 'C#: Async Void Exception Swallowing',
    language: 'csharp',
    category: 'Async & Threading',
    description: 'Async void methods cannot be awaited and unhandled exceptions crash the process.',
    code: `using System;
using System.Threading.Tasks;

public class OrderService {
    // Bug: async void cannot be caught by callers!
    public async void ProcessPaymentAsync(string orderId) {
        await Task.Delay(500);
        if (string.IsNullOrEmpty(orderId)) {
            throw new ArgumentNullException(nameof(orderId));
        }
        Console.WriteLine($"Order {orderId} processed.");
    }
}`
  },
  {
    id: 'rust-use-after-move',
    name: 'Rust: Ownership Transfer & Move Trap',
    language: 'rust',
    category: 'Memory & Borrowing',
    description: 'Ownership transfer leaving original variable invalid.',
    code: `// Rust Ownership and Move Semantics
fn process_payload() {
    let raw_payload = String::from("Authorization: Bearer secret_token_xyz");
    
    // Ownership of heap buffer moves to 'transferred'
    let transferred = raw_payload;
    
    // Compile error: raw_payload was moved!
    println!("Payload length: {}", raw_payload.len());
    println!("Processed: {}", transferred);
}`
  },
  {
    id: 'go-goroutine-leak',
    name: 'Go: Goroutine Leak on Unbuffered Channel',
    language: 'go',
    category: 'Concurrency & Deadlock',
    description: 'Unbuffered channel blocks unselected goroutines indefinitely.',
    code: `package main

import "fmt"

// Queries multiple mirrors and returns the fastest response
func queryMirrors(urls []string) string {
    // Bug: unbuffered channel blocks all slower workers!
    ch := make(chan string)
    
    for _, url := range urls {
        go func(u string) {
            ch <- fetchUrl(u)
        }(url)
    }
    
    // Only reads 1 message; leftover goroutines leak forever
    return <-ch
}`
  },
  {
    id: 'java-null-pointer',
    name: 'Java: Optional Unwrapping without Guard',
    language: 'java',
    category: 'Runtime Exception',
    description: 'Calling .get() directly on empty Optional raises NoSuchElementException.',
    code: `import java.util.Optional;

public class UserLookup {
    public static String getUpperEmail(Optional<String> emailOpt) {
        // Bug: Calling get() directly without isPresent() check
        return emailOpt.get().toUpperCase();
    }
}`
  },
  {
    id: 'sql-auth-injection',
    name: 'SQL: Authentication Bypass Injection',
    language: 'sql',
    category: 'Security Vulnerability',
    description: 'String concatenation query vulnerable to 1=1 bypass.',
    code: `-- Dangerous raw SQL query concatenation
-- If input_user = "' OR '1'='1" this bypasses password verification
SELECT user_id, email, role, is_admin 
FROM users_table 
WHERE username = '' + input_user + '' 
  AND password_hash = '' + input_pass + '';`
  },
  {
    id: 'bash-unquoted-vars',
    name: 'Bash: Unquoted Variable Word Splitting',
    language: 'bash',
    category: 'Shell Scripting',
    description: 'Unquoted variable in rm command causes unintended directory deletion.',
    code: `#!/usr/bin/env bash
# Dangerous unquoted shell expansion
TARGET_DIR="$1"

# If TARGET_DIR is empty or contains spaces, this is hazardous
rm -rf $TARGET_DIR/*
echo "Cleaned up $TARGET_DIR"`
  },
  {
    id: 'php-loose-comparison',
    name: 'PHP: Loose Equality Hash Collision Trap',
    language: 'php',
    category: 'Security & Type Juggling',
    description: 'Using == on password hashes converts 0e hashes to 0.',
    code: `<?php
function verifyToken($userToken, $expectedHash) {
    // Vulnerability: Loose comparison (==) triggers type juggling!
    // If both strings start with "0e...", PHP compares them as 0 == 0
    if ($userToken == $expectedHash) {
        return true;
    }
    return false;
}`
  },
  {
    id: 'ruby-frozen-string',
    name: 'Ruby: Mutating Frozen String Literal',
    language: 'ruby',
    category: 'Runtime Exception',
    description: '# frozen_string_literal: true causes FrozenError when calling mutating methods.',
    code: `# frozen_string_literal: true

def sanitize_header(header)
  # Bug: << mutates frozen string in place, raising FrozenError
  header << " (verified)"
  header
end`
  },
  {
    id: 'swift-force-unwrap',
    name: 'Swift: Force Unwrapping Nil Optional',
    language: 'swift',
    category: 'Runtime Crash',
    description: 'Using ! operator on nil URL or dictionary value crashes iOS app.',
    code: `import Foundation

func loadAvatar(urlString: String?) -> URL {
    // Crash: Force-unwrapping nil urlString causes fatal crash
    let url = URL(string: urlString!)!
    return url
}`
  },
  {
    id: 'kotlin-smart-cast',
    name: 'Kotlin: Mutable Property Smart Cast Failure',
    language: 'kotlin',
    category: 'Null Safety',
    description: 'Smart cast to non-null impossible on mutable properties.',
    code: `class SessionManager {
    var activeToken: String? = null

    fun getLength(): Int {
        // Warning: Smart cast impossible because 'activeToken' is a mutable property
        if (activeToken != null) {
            return activeToken!!.length // Risky force call !!
        }
        return 0
    }
}`
  }
];
