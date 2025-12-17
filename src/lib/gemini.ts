import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!apiKey) {
  // Avoid throwing at import time in serverless; errors will surface on call.
  console.warn('[gemini] Missing GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY')
}

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY)')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: modelName })
}
