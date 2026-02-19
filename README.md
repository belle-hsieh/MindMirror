# MindMirror 🪞

A wellness journaling and mental health companion app built with Next.js 15. MindMirror helps users track their mental well-being through journaling, mood tracking, and AI-powered conversational support.

## ✨ Features

- **Journal Entries**: Write and manage personal journal entries with a rich text editor
- **Mood Tracking**: Track emotions over time with visual word cloud representations
- **AI Chatbot**: Conversational wellness assistant powered by Google Gemini AI
- **Voice Input**: Speech-to-text functionality for hands-free journaling
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **User Authentication**: Secure sign-up and login with Supabase Auth

## 🛠️ Tech Stack

### Framework & Core
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
- **[Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)** - Server-side authentication

### AI & Rich Text
- **[Google Generative AI](https://ai.google.dev/)** - Gemini AI integration for chatbot
- **[TipTap](https://tiptap.dev/)** - Rich text editor

## 📁 Project Structure

```
MindMirror/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── debug-auth/
│   │   │   └── gemini/
│   │   │       └── models/
│   │   ├── chatbot/
│   │   │   ├── api/
│   │   │   │   └── sessions/
│   │   │   │       ├── route.ts
│   │   │   │       └── [sessionId]/
│   │   │   │           ├── route.ts
│   │   │   │           └── messages/
│   │   │   │               └── route.ts
│   │   │   ├── components/
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   └── ChatWindow.tsx
│   │   │   └── page.tsx
│   │   ├── journal/
│   │   │   ├── api/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── components/
│   │   │   │   ├── AudioToText.tsx
│   │   │   │   ├── JournalEditor.tsx
│   │   │   │   └── JournalSidebar.tsx
│   │   │   └── page.tsx
│   │   ├── mood/
│   │   │   ├── api/
│   │   │   │   └── filterByTime.ts
│   │   │   ├── components/
│   │   │   │   ├── EmotionInput.tsx
│   │   │   │   └── WordCloud.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── CornerImage.tsx
│   │   ├── HeaderAuth.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── TipTap.jsx
│   ├── lib/
│   │   ├── gemini.ts
│   │   ├── supabase.ts
│   │   └── supabaseServer.ts
│   ├── types/
│   │   ├── chat.ts
│   │   ├── emotion.ts
│   │   └── journal.ts
│   └── middleware.ts
├── .env.local
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- A [Supabase](https://supabase.com/) account and project
- A [Google AI Studio](https://aistudio.google.com/) API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

You'll need to create the following tables in Supabase:

#### `journal_entries`
```sql
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `chat_sessions`
```sql
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `chat_messages`
```sql
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `emotions`
```sql
create table emotions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  emotion text not null,
  intensity integer not null check (intensity >= 1 and intensity <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/belle-hsieh/MindMirror.git
cd MindMirror
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🔒 Authentication & Protected Routes

The app uses Supabase Authentication with middleware protection for:
- `/chatbot` - AI chat interface
- `/journal` - Journal entries
- `/mood` - Mood tracking

Unauthenticated users are redirected to `/login` with a redirect parameter.

## 🎨 Features in Detail

### Journal
- Create, edit, and delete personal journal entries
- Rich text editing support
- Voice-to-text input using Web Speech API
- Automatic timestamps

### Mood Tracker
- Log emotions with intensity ratings (1-10)
- Visual word cloud representation of emotional patterns
- Filter by time periods

### AI Chatbot
- Context-aware conversations using Google Gemini
- Session management (create, rename, delete)
- Conversation history
- Automatic chat title generation

## 🎯 Design Decisions & Architecture

### Current Design: Manual vs. Automated Emotion Tracking

**Why Two Separate Features?**

Currently, MindMirror maintains **separate systems** for journaling and mood tracking:

1. **Journal** - Free-form text entries for detailed reflection
2. **Mood Tracker** - Explicit emotion logging with intensity ratings

This separation was intentional for several reasons:

- **User Control**: Allows users to consciously reflect on and label their emotions
- **Data Quality**: Explicit ratings provide structured, quantifiable data
- **Privacy**: Users can journal freely without automatic analysis of sensitive content
- **Simplicity**: Easier initial implementation without NLP dependencies
- **Accuracy**: User-labeled emotions are ground truth; NLP has inherent inaccuracy

### Future Enhancement: NLP-Powered Emotion Analysis

**Planned Integration** (Q2 2026):

We're planning to enhance the mood tracking feature with **automatic emotion extraction from journal entries** using Natural Language Processing.

#### Technical Approach

```
Journal Entry → NLP Analysis → Emotion Detection → WordCloud Visualization
```

**Implementation Strategy:**

1. **Sentiment Analysis Pipeline**
   - Use Google Gemini AI (already integrated) for emotion extraction
   - Prompt engineering: "Analyze this journal entry and extract emotions with intensity (1-10)"
   - Parse structured response into emotion/intensity pairs

2. **Hybrid Model**
   ```typescript
   interface EmotionSource {
     manual: boolean;        // User-entered via mood tracker
     auto_generated: boolean; // NLP extracted from journal
     confidence_score?: number; // For auto-generated emotions
   }
   ```

3. **Database Schema Addition**
   ```sql
   ALTER TABLE emotions ADD COLUMN source text default 'manual';
   ALTER TABLE emotions ADD COLUMN journal_entry_id uuid references journal_entries;
   ALTER TABLE emotions ADD COLUMN confidence_score float;
   ```

4. **Processing Options**
   - **Real-time**: Analyze during journal save (may slow down UX)
   - **Batch**: Nightly cron job for all new/updated entries
   - **On-demand**: User clicks "Analyze emotions" button

#### Word Cloud Enhancement

**Current**: Only shows manually tracked emotions

**Future**: Merged visualization
- Manual emotions (bright/saturated colors, larger size)
- Auto-detected emotions (muted colors, smaller size)
- Toggle to show/hide auto-generated vs manual
- Click emotion to see source journal entries

#### Challenges to Address

1. **Accuracy vs. User Experience**
   - NLP may miss nuanced emotions or context
   - Solution: Show confidence scores, allow user correction

2. **Performance**
   - API calls for every journal entry could be costly
   - Solution: Optional feature, batch processing, caching

3. **Privacy Concerns**
   - Sending journal content to external AI service
   - Solution: Make opt-in, clearly communicate data usage

4. **Data Consistency**
   - How to handle conflicting manual vs. auto emotions?
   - Solution: Prioritize manual entries, show both with visual distinction

#### API Changes

```typescript
// New endpoint for emotion analysis
POST /journal/api/[id]/analyze-emotions
Response: {
  emotions: Array<{
    emotion: string;
    intensity: number;
    confidence: number;
    context_snippet: string; // Text that suggested this emotion
  }>
  suggested_save: boolean; // Whether to auto-save to mood tracker
}

// Enhanced word cloud endpoint
GET /mood/api/emotions?sources=manual,auto&startDate=...
```

#### Migration Path

1. **Phase 1**: Add backend emotion analysis (no UI changes)
2. **Phase 2**: Add "Analyze" button to journal entries
3. **Phase 3**: Integrate with word cloud (dual-source visualization)
4. **Phase 4**: Optional automatic analysis on save
5. **Phase 5**: ML model fine-tuning based on user corrections

### Why Not Now?

The current manual system allows us to:
- Validate user needs and usage patterns
- Build a dataset of user-labeled emotions for future training
- Keep the MVP focused and performant
- Avoid over-engineering before product-market fit

Once we have sufficient user feedback and usage data, we'll implement NLP enhancement as a **value-add feature** rather than a replacement for manual tracking.

## 📝 API Routes

### Journal API
- `GET /journal/api` - List all entries
- `POST /journal/api` - Create new entry
- `GET /journal/api/[id]` - Get specific entry
- `PUT /journal/api/[id]` - Update entry
- `DELETE /journal/api/[id]` - Delete entry

### Chatbot API
- `GET /chatbot/api/sessions` - List all sessions
- `POST /chatbot/api/sessions` - Create new session
- `DELETE /chatbot/api/sessions/[sessionId]` - Delete session
- `PATCH /chatbot/api/sessions/[sessionId]` - Rename session
- `GET /chatbot/api/sessions/[sessionId]/messages` - Get messages
- `POST /chatbot/api/sessions/[sessionId]/messages` - Send message

## 🚢 Deployment

The app is configured for deployment on [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import the project on Vercel
3. Add environment variables
4. Deploy

## 📄 License

This project is private and not licensed for public use.

## 👤 Author

Belle Hsieh

---

Built with ❤️ using Next.js and Supabase
