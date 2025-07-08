import CornerImage from '../components/ui/CornerImage';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Corner Images */}
      <div className="fixed inset-0 z-0">
        <CornerImage
          position="top-left"
          src="/corner-top-left.png"
          alt="Top-left corner decoration"
        />
        <CornerImage
          position="top-right"
          src="/corner-top-right.png"
          alt="Top-right corner decoration"
        />
        <CornerImage
          position="bottom-left"
          src="/corner-bottom-left.png"
          alt="Bottom-left corner decoration"
        />
        <CornerImage
          position="bottom-right"
          src="/corner-bottom-right.png"
          alt="Bottom-right corner decoration"
        />
      </div>
      
      <main className="relative z-10 centered-content">
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
            <p className="text-gray-600">Track your thoughts & daily experiences</p>
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
            <p className="text-gray-600">Explore journal prompts & wellness exercises</p>
          </a>
        </div>
      </main>
    </div>
  )
}
