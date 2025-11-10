#!/usr/bin/env tsx
/**
 * Test AI Integrations: Grok, OpenAI, Hugging Face
 * Usage: npx tsx scripts/test-ai-integrations.ts
 */

import { generateGrokCompletion } from '../lib/integrations/grok';
import { generateChatCompletion } from '../lib/integrations/openai';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGrok() {
  log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '🤖 Testing Grok (xAI) Integration');
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const prompt = 'Hello! Can you respond with a simple greeting?';
    log('blue', `Prompt: ${prompt}`);
    
    const response = await generateGrokCompletion(prompt, {
      model: 'grok-beta',
      temperature: 0.7,
      maxTokens: 50,
    });
    
    log('green', '✅ Grok API call successful!');
    log('blue', `Response: ${JSON.stringify(response.choices[0].message.content, null, 2)}`);
    return true;
  } catch (error) {
    log('red', '❌ Grok test failed');
    log('red', `Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function testOpenAI() {
  log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '🧠 Testing OpenAI GPT Integration');
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const messages = [
      {
        role: 'user' as const,
        content: 'Say "OpenAI integration working!" if you can read this.',
      },
    ];
    
    log('blue', `Messages: ${JSON.stringify(messages, null, 2)}`);
    
    const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', {
      temperature: 0.7,
      maxTokens: 50,
      stream: false,
    });
    
    log('green', '✅ OpenAI API call successful!');
    if ('choices' in response) {
      log('blue', `Response: ${response.choices[0].message.content}`);
    }
    return true;
  } catch (error) {
    log('red', '❌ OpenAI test failed');
    log('red', `Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function testCopilot() {
  log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '💡 GitHub Copilot Status');
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  log('yellow', 'ℹ️  GitHub Copilot is a VS Code extension, not an API integration');
  log('blue', 'Check VS Code status bar for Copilot status');
  log('blue', 'Or run: code --list-extensions | grep copilot');
  return true;
}

async function main() {
  log('cyan', '\n╔══════════════════════════════════════════════════════╗');
  log('cyan', '║     AI Integrations Test Suite                      ║');
  log('cyan', '╚══════════════════════════════════════════════════════╝');
  
  // Check environment variables
  log('yellow', '\n📋 Checking Environment Variables...');
  const envVars = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'GROK_API_KEY': process.env.GROK_API_KEY || process.env.XAI_API_KEY,
    'HUGGINGFACE_TOKEN': process.env.HUGGINGFACE_TOKEN,
  };
  
  for (const [key, value] of Object.entries(envVars)) {
    const isSet = value && !value.includes('...') && !value.includes('${');
    if (isSet) {
      log('green', `✅ ${key} is set (${value.substring(0, 10)}...)`);
    } else {
      log('red', `❌ ${key} is NOT set or is a placeholder`);
    }
  }
  
  const results = {
    copilot: await testCopilot(),
    grok: await testGrok(),
    openai: await testOpenAI(),
    huggingface: false, // Will test with Python script
  };
  
  // Summary
  log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '📊 Test Summary');
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const [integration, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(color, `${status} - ${integration.toUpperCase()}`);
  }
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (passedCount === totalCount) {
    log('green', `✅ All ${passedCount}/${totalCount} tests passed!`);
  } else {
    log('yellow', `⚠️  ${passedCount}/${totalCount} tests passed`);
    log('yellow', '\n💡 To fix failures:');
    log('yellow', '   1. Run: ./scripts/sync-secrets.sh');
    log('yellow', '   2. Copy real API keys from GitHub Secrets');
    log('yellow', '   3. Update .env.local with actual values');
  }
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(passedCount === totalCount ? 0 : 1);
}

main().catch(console.error);
