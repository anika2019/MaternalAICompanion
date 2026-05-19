'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Info, 
  Sparkles,
  Heart,
  Plus
} from 'lucide-react';

export default function PublicChatPage() {
  // Client state
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [guestUserId, setGuestUserId] = useState<string>('');

  // Set up or retrieve unique anonymous guest ID
  useEffect(() => {
    let id = localStorage.getItem('materna_guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('materna_guest_id', id);
    }
    setGuestUserId(id);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isChatLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          conversationId: conversationId,
          guestUserId: guestUserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Error: ' + (data.error || 'Failed to connect to assistant') }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'An unexpected error occurred.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const parseMarkdownToHtml = (markdownText: string): string => {
    if (!markdownText) return '';
    let html = markdownText;
    
    // Escape HTML to prevent XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle list items (- item or * item)
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        let prefix = '';
        if (!inList) {
          inList = true;
          prefix = '<ul class="chat-list">';
        }
        return `${prefix}<li>${content}</li>`;
      } else {
        let suffix = '';
        if (inList) {
          inList = false;
          suffix = '</ul>';
        }
        return `${suffix}${trimmed ? `<p>${trimmed}</p>` : '<br/>'}`;
      }
    });
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('');
  };

  const renderAssistantMessage = (text: string) => {
    try {
      // Try to parse the text as JSON if the Dify output is structured
      let cleanText = text;
      if (typeof text === 'string') {
          cleanText = text.trim();
          cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      }
      const data = JSON.parse(cleanText);
      
      // 1. Check if it's the structured advice format
      if (data.personalized_advice || data.greeting || data.safety_note || data.sources) {
        return (
          <div className="structured-advice-response">
            {data.greeting && (
              <div className="advice-greeting">
                {data.greeting}
              </div>
            )}
            {data.personalized_advice && (
              <div 
                className="advice-body" 
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(data.personalized_advice) }} 
              />
            )}
            {data.safety_note && (
              <div className="advice-safety-card">
                <span className="safety-icon">🩺</span>
                <div className="safety-content">
                  <strong>Safety Note:</strong> {data.safety_note}
                </div>
              </div>
            )}
            {data.sources && Array.isArray(data.sources) && data.sources.length > 0 && (
              <div className="advice-sources">
                <span className="sources-icon">📚</span>
                <span><strong>Sources:</strong> {data.sources.join(', ')}</span>
              </div>
            )}
          </div>
        );
      }
      
      // 2. Fallback check for single answers inside JSON
      const content = data.response || data.answer || cleanText;
      return <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }} />;
      
    } catch (e) {
      // Fallback for plain text
      return <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(text) }} />;
    }
  };

  return (
    <div className="layout">
      {/* Sidebar Component */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🤰</div>
          <h1>MaternaAI</h1>
        </div>

        <div className="guest-profile">
          <div className="profile-header">
            <div className="avatar">🌿</div>
            <div className="info">
              <h3>Anonymous Guest</h3>
              <p>General Advice Mode</p>
            </div>
          </div>
          <div className="tags">
            <span>Anonymous</span>
            <span>No sign-in</span>
            <span>General advice</span>
          </div>
        </div>

        <button className="new-thread" onClick={startNewConversation}>
          <Plus size={18} />
          New Conversation
        </button>

        {/* Call to Action to Personalize */}
        <div className="personalize-card">
          <div className="spark-header">
            <Sparkles size={16} className="sparkle-icon" />
            <h4>Get Personalized Guidance</h4>
          </div>
          <p>Create a profile to get maternity insights tailored precisely to your specific pregnancy week, trimester, diet type, and medical symptoms.</p>
          <Link href="/" className="personalize-btn">
            Sign Up / Register
          </Link>
        </div>

        <div className="sidebar-footer">
          <div className="footer-note">
            <Heart size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>Support at every step</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        <header className="top-bar">
          <div className="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/" className="back-btn">
                <ArrowLeft size={16} />
                <span>Login Screen</span>
              </Link>
            </div>
          </div>
          <div className="status-badge-container">
            <div className="status-badge guest">
              <span className="dot"></span>
              Guest Mode (Anonymous)
            </div>
          </div>
        </header>

        {/* Warning/Info banner to upgrade */}
        <div className="upgrade-banner">
          <div className="banner-content">
            <Sparkles size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <p>
              <strong>Want custom guidance?</strong> You are asking as a guest. 
              <Link href="/" style={{ color: 'var(--accent-primary)', marginLeft: '6px', fontWeight: '600', textDecoration: 'underline' }}>
                Sign up/Login
              </Link> to unlock advice customized to your exact pregnancy progress!
            </p>
          </div>
        </div>

        <div className="view">
          {messages.length === 0 ? (
            <div className="hero">
              <div className="hero-icon">🌿</div>
              <h1>General Maternity Advice</h1>
              <p className="hero-text">
                Ask any questions about pregnancy, prenatal wellness, symptoms, diet, or baby care.<br />
                Our virtual maternity companion is available immediately, with no logins required.
              </p>

              <div className="cards">
                <div className="card" onClick={() => setQuery('What foods should I absolutely avoid during pregnancy?')}>
                  <h3>❌ Avoid Foods</h3>
                  <p>Common foods and beverages to skip for baby's safety</p>
                </div>
                <div className="card" onClick={() => setQuery('What are the key vitamins and supplements needed during pregnancy?')}>
                  <h3>💊 Essential Vitamins</h3>
                  <p>Important nutrients like Folic Acid, Iron, and Calcium</p>
                </div>
                <div className="card" onClick={() => setQuery('Safe exercise guidelines in the second trimester')}>
                  <h3>🧘 Safe Exercises</h3>
                  <p>Gentle workout guidelines to keep you active and healthy</p>
                </div>
              </div>

              <div className="suggestions">
                <button onClick={() => setQuery('How much water should I drink daily during pregnancy?')}>How much water to drink?</button>
                <button onClick={() => setQuery('Tips to combat morning sickness')}>Morning sickness remedies</button>
                <button onClick={() => setQuery('Is mild cramping normal in the first trimester?')}>Is early cramping normal?</button>
                <button onClick={() => setQuery('What should I pack in my hospital bag?')}>Hospital bag checklist</button>
              </div>
            </div>
          ) : (
            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-content">
                    {msg.role === 'assistant' ? renderAssistantMessage(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-message assistant">
                  <div className="message-content loading">...</div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="chat-dock">
          <form className="input-box" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Ask a general pregnancy or wellness question..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isChatLoading}
            />
            <button type="submit" className={`send-btn ${query && !isChatLoading ? 'ready' : ''}`} disabled={isChatLoading || !query}>
              <Send size={20} />
            </button>
          </form>
          <div className="legal">
            <Info size={12} />
            <span>For informational purposes only. Always consult your doctor for medical advice.</span>
          </div>
        </footer>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          height: 100vh;
          background: white;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 300px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--card-border);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .logo { font-size: 28px; }
        .brand h1 { font-size: 22px; font-weight: 700; }

        .guest-profile {
          background: white;
          padding: 20px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 20px rgba(184, 102, 122, 0.06);
          margin-bottom: 24px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          background: #fdf1f3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .info h3 { font-size: 15px; font-weight: 600; }
        .info p { font-size: 12px; color: var(--accent-primary); font-weight: 500; }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tags span {
          font-size: 10px;
          font-weight: 500;
          padding: 4px 10px;
          background: var(--bg-primary);
          border-radius: 20px;
          color: var(--text-muted);
          border: 1px solid #eee;
        }

        .new-thread {
          background: #f5ecea;
          color: var(--text-main);
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }
        .new-thread:hover { background: #ebdcd9; }
        .new-thread:active { transform: scale(0.98); }

        /* Upgrade CTA Card */
        .personalize-card {
          background: #fff8f8;
          border: 1px dashed var(--accent-primary);
          padding: 20px;
          border-radius: var(--radius-md);
          margin-bottom: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .spark-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent-primary);
        }

        .sparkle-icon {
          animation: spin-glow 3s infinite ease-in-out;
        }

        @keyframes spin-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .personalize-card h4 {
          font-size: 14px;
          font-weight: 600;
        }

        .personalize-card p {
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .personalize-btn {
          background: var(--accent-primary);
          color: white;
          text-align: center;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition);
          box-shadow: 0 4px 10px rgba(184, 102, 122, 0.15);
        }

        .personalize-btn:hover {
          background: #a35568;
          transform: translateY(-1px);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Main Content Styles */
        .content { flex: 1; display: flex; flex-direction: column; background: white; }

        .top-bar {
          padding: 20px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f8f8f8;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          background: var(--bg-primary);
          transition: var(--transition);
        }
        .back-btn:hover {
          color: var(--text-main);
          background: #f3e9e4;
        }

        .status-badge-container {
          display: flex;
          align-items: center;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .status-badge.guest {
          color: var(--accent-primary);
          background: #fff5f7;
        }

        .dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: var(--accent-primary);
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Upgrade Banner */
        .upgrade-banner {
          background: #fdf5f6;
          border-bottom: 1px solid #fae0e5;
          padding: 10px 48px;
        }

        .banner-content {
          max-width: 840px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-main);
        }

        .banner-content p {
          margin: 0;
        }

        .view {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 48px;
          overflow-y: auto;
        }

        .hero { max-width: 840px; width: 100%; text-align: center; }
        .hero-icon {
          width: 72px;
          height: 72px;
          background: #fff5f7;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 24px;
        }

        .hero h1 { font-size: 38px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
        .hero-text { font-size: 16px; color: var(--text-muted); line-height: 1.6; margin-bottom: 36px; }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }

        .card {
          background: white;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: left;
          transition: var(--transition);
          cursor: pointer;
        }

        .card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 12px 30px rgba(184, 102, 122, 0.05);
          transform: translateY(-4px);
        }

        .card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
        .card p { font-size: 12px; color: var(--text-muted); line-height: 1.4; }

        .suggestions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .suggestions button {
          background: white;
          border: 1px solid #eee;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 13px;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition);
        }
        .suggestions button:hover { border-color: var(--accent-primary); color: var(--accent-primary); background: #fff5f7; }

        .chat-history {
          width: 100%;
          max-width: 840px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .chat-message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .chat-message.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-content {
          padding: 16px 20px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.5;
        }

        .chat-message.user .message-content {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-message.assistant .message-content {
          background: white;
          border: 1px solid #eee;
          color: var(--text-main);
          border-bottom-left-radius: 4px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        /* Structured Advice Styles */
        .structured-advice-response {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .advice-greeting {
          font-size: 16px;
          font-weight: 600;
          color: var(--accent-primary);
          line-height: 1.4;
        }

        .advice-body {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-main);
        }

        .advice-body p {
          margin-bottom: 12px;
        }

        .advice-body p:last-child {
          margin-bottom: 0;
        }

        .advice-safety-card {
          display: flex;
          gap: 12px;
          background: #fff5f5;
          border-left: 4px solid #e53e3e;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 14px;
          color: #c53030;
          line-height: 1.5;
        }

        .safety-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .safety-content strong {
          color: #9b2c2c;
        }

        .advice-sources {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          border-top: 1px solid #f9eee9;
          padding-top: 12px;
          margin-top: 4px;
        }

        .sources-icon {
          font-size: 14px;
        }

        .chat-list {
          padding-left: 20px;
          margin: 8px 0 12px;
          list-style-type: disc;
        }

        .chat-list li {
          margin-bottom: 6px;
          color: var(--text-main);
        }

        .chat-list li:last-child {
          margin-bottom: 0;
        }

        .chat-dock { padding: 0 48px 48px; background: linear-gradient(transparent, white 20%); }
        .input-box {
          max-width: 840px;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          border-radius: 20px;
        }

        .input-box input {
          width: 100%;
          padding: 22px 64px 22px 28px;
          background: white;
          border: 1px solid #eee;
          border-radius: 20px;
          font-size: 16px;
        }

        .send-btn {
          position: absolute;
          right: 14px;
          top: 14px;
          width: 44px;
          height: 44px;
          background: #f0e0e3;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .send-btn.ready { background: var(--accent-primary); }

        .legal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 12px;
          color: #b0a09e;
        }
      `}</style>
    </div>
  );
}
