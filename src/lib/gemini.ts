import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!apiKey) {
  // Avoid throwing at import time in serverless; errors will surface on call.
  console.warn('[gemini] Missing GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY')
}

type GeminiContents = Array<{ role: string; parts: Array<{ text: string }> }>

const getModelCandidates = (preferred?: string) => {
  const candidates = [
    preferred,
    process.env.GEMINI_MODEL,
    'models/gemini-2.5-flash',
    'models/gemini-2.5-flash-lite',
    'models/gemini-2.5-pro',
    'models/gemini-2.0-flash',
    'models/gemini-2.0-flash-001',
    'models/gemini-2.0-flash-lite',
    'models/gemini-2.0-flash-lite-001',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-1.0-pro',
  ].filter(Boolean) as string[]

  const expanded = candidates.flatMap((name) => {
    if (name.startsWith('models/')) return [name]
    return [name, `models/${name}`]
  })

  return Array.from(new Set(expanded))
}

export async function generateGeminiContent(contents: GeminiContents, preferredModel?: string) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY)')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1'
  const models = getModelCandidates(preferredModel)
  let lastError: unknown = null

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion })
      const res = await model.generateContent({ contents })
      return { text: res.response.text(), modelName }
    } catch (error) {
      lastError = error
    }
  }

  const details = models.length ? ` Tried: ${models.join(', ')}` : ''
  const baseError = lastError instanceof Error ? lastError : new Error('Failed to generate content')
  throw new Error(`${baseError.message}${details}`)
}
