import { OllamaService } from '../services/ollamaService.js';
import { CodeLensPrompts } from '../prompts/codeLensPrompts.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 CodeLens — Local LLM Backend Integration Tests');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // Test 1: Ollama Status check
  console.log('1. Testing Ollama Status & Connectivity Detection...');
  const status = await OllamaService.checkStatus();
  assert(typeof status.online === 'boolean', 'OllamaService.checkStatus returns online boolean');
  assert(status.endpoint.includes('11434'), 'OllamaService targets port 11434 by default');
  assert(Array.isArray(status.models), 'OllamaService returns models list');

  // Test 2: CodeLens Prompt Generation
  console.log('\n2. Testing CodeLens Prompt Engine...');
  const sampleCode = 'def add_item(x, items=[]):\n    items.append(x)\n    return items';
  const explainPrompt = CodeLensPrompts.buildPrompt({ code: sampleCode, language: 'python', mode: 'explain' });
  assert(explainPrompt.systemPrompt.includes('CodeLens AI'), 'System prompt contains CodeLens identity');
  assert(explainPrompt.userPrompt.includes('algorithmicApproach'), 'Explain prompt includes algorithmic schema');

  const debugPrompt = CodeLensPrompts.buildPrompt({ code: sampleCode, language: 'python', mode: 'debug' });
  assert(debugPrompt.userPrompt.includes('correctedFullCode'), 'Debug prompt includes correctedFullCode schema');

  const optimizePrompt = CodeLensPrompts.buildPrompt({ code: sampleCode, language: 'python', mode: 'optimize' });
  assert(optimizePrompt.userPrompt.includes('optimizedFullCode'), 'Optimize prompt includes optimizedFullCode schema');

  // Test 3: Generation & Fallback Execution
  console.log('\n3. Testing CodeLens Generation & Fallback Engine...');
  const explainResult = await OllamaService.generate(explainPrompt);
  assert(explainResult.success === true, 'OllamaService.generate returns success: true');
  assert(Boolean(explainResult.data.summary), 'Explain result includes summary');

  const debugResult = await OllamaService.generate(debugPrompt);
  assert(Array.isArray(debugResult.data.bugs), 'Debug result includes bugs array');

  const optimizeResult = await OllamaService.generate(optimizePrompt);
  assert(Boolean(optimizeResult.data.optimizedFullCode), 'Optimize result includes optimizedFullCode');

  // Test 4: Follow-up Conversational Q&A
  console.log('\n4. Testing Follow-up Q&A Conversational Chat...');
  const chatResult = await OllamaService.chat(
    [{ role: 'user', content: 'What is the Big-O time complexity of this code?' }],
    sampleCode,
    { language: 'python' }
  );
  assert(chatResult.success === true, 'OllamaService.chat returns success: true');
  assert(typeof chatResult.reply === 'string' && chatResult.reply.length > 20, 'Q&A returns rich conversational reply');

  console.log('\n====================================================');
  console.log(`📊 Test Summary: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
