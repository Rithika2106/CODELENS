import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  ollama: {
    baseUrl: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, ''),
    defaultModel: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
    timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 120000, // 120s for cold model loading
  },
  rateLimit: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // max 60 requests per minute
  },
  maxCodeLength: 50000, // 50KB limit
  supportedLanguages: [
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
  ],
  modes: ['debug', 'explain', 'optimize']
};
