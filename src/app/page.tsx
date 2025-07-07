export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="centered-content">
        <div className="title-container">
          <h1 className="main-title">
            MindMirror:
          </h1>
          <h2 className="subtitle">
            Your Personal Health & Wellness Companion
          </h2>
        </div>
        <div className="feature-container">
          {/* Journal Card */}
          <a href="/journal" className="feature-card">
            <div className="feature-emoji">📝</div>
            <h2 className="text-xl font-bold mb-2">Journal</h2>
            <p className="text-gray-600">Track your thoughts and daily experiences</p>
          </a>

          {/* Mood Card */}
          <a href="/mood" className="feature-card">
            <div className="feature-emoji">😊</div>
            <h2 className="text-xl font-bold mb-2">Mood Tracker</h2>
            <p className="text-gray-600">Monitor your emotional well-being</p>
          </a>

          {/* Chatbot Card */}
          <a href="/chatbot" className="feature-card">
            <div className="feature-emoji">🤖</div>
            <h2 className="text-xl font-bold mb-2">Chatbot</h2>
            <p className="text-gray-600">Converse with your wellness companion</p>
          </a>
        </div>
      </main>
    </div>
  )
}
