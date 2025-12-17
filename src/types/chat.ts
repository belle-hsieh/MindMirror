export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatSession {
  id: string
  title: string
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: ChatRole
  content: string
  created_at: string
}
