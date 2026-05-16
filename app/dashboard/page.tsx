'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Plus, 
  MessageSquare, 
  Moon, 
  Send, 
  LogOut, 
  Info,
  Thermometer,
  Syringe,
  Calendar,
  Settings,
  Search,
  Trash2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Chat state
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Conversations state
  const [recentConversations, setRecentConversations] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/'); // Redirect to login page if not authenticated
      } else {
        const fullUser = { ...user.user_metadata, id: user.id, phone: user.phone || user.user_metadata?.phone };
        setUserData(fullUser);
        setLoadingAuth(false);
        fetchConversations(fullUser.phone || fullUser.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const fetchConversations = async (userId: string) => {
    try {
      const res = await fetch(`/api/conversations?user=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setRecentConversations(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    }
  };

  const loadConversation = async (convId: string) => {
    if (!userData) return;
    setConversationId(convId);
    setIsChatLoading(true);
    try {
      const res = await fetch(`/api/messages?user=${encodeURIComponent(userData.phone || userData.id || 'anonymous_user')}&conversation_id=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok && data.data) {
        // Dify returns messages in descending order (newest first usually), we need ascending
        const sortedMessages = data.data.reverse();
        const formattedMessages: {role: 'user'|'assistant', text: string}[] = [];
        for (const msg of sortedMessages) {
          formattedMessages.push({ role: 'user', text: msg.query });
          formattedMessages.push({ role: 'assistant', text: msg.answer });
        }
        setMessages(formattedMessages);
      }
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const res = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          user: userData?.phone || userData?.id || 'anonymous_user'
        })
      });
      
      if (res.ok) {
        if (conversationId === convId) {
          startNewConversation();
        }
        fetchConversations(userData?.phone || userData?.id || 'anonymous_user');
      } else {
        const errorData = await res.json();
        alert(`Failed to delete conversation: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error deleting conversation', err);
      alert('An error occurred while deleting the conversation.');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isChatLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          userData: userData,
          conversationId: conversationId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
          // Refresh conversations list to show the new one
          if (userData) {
            fetchConversations(userData.phone || userData.id || 'anonymous_user');
          }
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

  const renderAssistantMessage = (text: string, isFirst: boolean) => {
    try {
      // Try to parse the text as JSON
      let cleanText = text;
      if (typeof text === 'string') {
          cleanText = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      }
      const data = JSON.parse(cleanText);
      
      // If it's a JSON response with patient details
      if (isFirst || data.name || data.pregnancy_week || data.health_condition) {
        return (
          <div className="structured-response">
            <div className="structured-data-box">
              <div className="data-row"><strong>Name:</strong> {data.name || userData?.full_name || 'N/A'}</div>
              <div className="data-row"><strong>Age:</strong> {data.age || userData?.age || 'N/A'}</div>
              <div className="data-row"><strong>Pregnancy Week:</strong> {data.pregnancy_week || userData?.pregnancy_week || 'N/A'}</div>
              <div className="data-row"><strong>Health Condition:</strong> {data.health_condition || userData?.health_conditions || 'None'}</div>
              <div className="data-row"><strong>Diet Type:</strong> {data.diet_type || userData?.diet_type || 'N/A'}</div>
            </div>
            <div className="structured-text" dangerouslySetInnerHTML={{ __html: (data.response || data.answer || '').replace(/\n/g, '<br/>') }} />
          </div>
        );
      } else {
        // If it's JSON but only contains the response
        return <div dangerouslySetInnerHTML={{ __html: (data.response || data.answer || cleanText).replace(/\n/g, '<br/>') }} />;
      }
    } catch (e) {
      // Fallback for plain text
      return <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
  };

  if (loadingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }}>Authenticating...</div>;
  }

  return (
    <div className="layout">
      {/* Sidebar Component */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🤰</div>
          <h1>MaternaAI</h1>
        </div>

        <div className="user-profile">
          <div className="profile-header">
            <div className="avatar">🌿</div>
            <div className="info">
              <h3>{userData?.full_name || 'Anjali Mehta'}</h3>
              {userData?.age && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Age: {userData.age}</p>}
              <p>
                {userData?.pregnancy_week ? `Week ${userData.pregnancy_week} • ` : ''}
                {userData?.trimester ? userData.trimester.replace('_', ' ') : '1st Trimester'}
              </p>
            </div>
          </div>
          <div className="tags">
            {userData?.health_conditions && userData.health_conditions.split(',').map((cond: string, i: number) => (
              <span key={i}>{cond.trim()}</span>
            ))}
            {userData?.diet_type && <span>{userData.diet_type}</span>}
            {!userData?.health_conditions && !userData?.diet_type && (
              <>
                <span>Morning sickness</span>
                <span>PCOS history</span>
                <span>IVF pregnancy</span>
              </>
            )}
          </div>
        </div>

        <button className="new-thread" onClick={startNewConversation}>
          <Plus size={18} />
          New Conversation
        </button>

        <div className="nav-group">
          <label>RECENT CHATS</label>
          <div className="recent-chats-list">
            {recentConversations.length > 0 ? recentConversations.map((conv) => (
              <div 
                key={conv.id} 
                className={`nav-item ${conversationId === conv.id ? 'active' : ''}`}
                onClick={() => loadConversation(conv.id)}
              >
                <MessageSquare size={16} />
                <span className="truncate" style={{ flex: 1 }}>{conv.name || 'New Conversation'}</span>
                <button 
                  className="delete-conv-btn"
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  title="Delete Conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <div className="nav-item" style={{ pointerEvents: 'none', opacity: 0.5 }}>
                <span>No recent chats</span>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="mini-profile">
            <div className="mini-avatar">🌿</div>
            <div className="mini-info">
              <h4>{userData?.full_name || 'Anjali Mehta'}</h4>
              <p>{userData?.pregnancy_week ? `Week ${userData.pregnancy_week}` : 'Week 8'}</p>
            </div>
          </div>
          <div className="footer-actions">
            <button className="icon-btn" onClick={handleSignOut} title="Sign Out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        <header className="top-bar">
          <div className="status">
            <h2>Maternity Assistant</h2>
            <div className="status-badge">
              <span className="dot"></span>
              Personalized Mode
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <button className="icon-btn"><Moon size={18} /></button>
            <button className="icon-btn"><Settings size={18} /></button>
          </div>
        </header>

        <div className="view">
          {messages.length === 0 ? (
            <div className="hero">
              <div className="hero-icon">🌿</div>
              <h1>Hello, {userData?.full_name ? userData.full_name.split(' ')[0] : 'Anjali'}!</h1>
              <p className="hero-text">
                I'm your personalized maternity assistant, adapted for your journey.<br />
                {userData?.pregnancy_week ? (
                  <>You're at <strong>Week {userData.pregnancy_week}</strong> — all my guidance is tailored to your profile.</>
                ) : (
                  <>You're at <strong>Week 8</strong> — all my guidance is tailored to your profile.</>
                )}
              </p>

              <div className="cards">
                <div className="card">
                  <div className="card-top" style={{ color: '#2e7d32' }}>
                    <Thermometer size={20} />
                  </div>
                  <h3>Nausea Relief</h3>
                  <p>Managing morning sickness safely</p>
                </div>
                <div className="card">
                  <div className="card-top" style={{ color: '#1976d2' }}>
                    <Syringe size={20} />
                  </div>
                  <h3>IVF Guidance</h3>
                  <p>Specific care for IVF pregnancies</p>
                </div>
                <div className="card">
                  <div className="card-top" style={{ color: '#673ab7' }}>
                    <Calendar size={20} />
                  </div>
                  <h3>Milestones</h3>
                  <p>{userData?.pregnancy_week ? `Week ${userData.pregnancy_week}` : 'Week 8'} scans and what to expect</p>
                </div>
              </div>

              <div className="suggestions">
                <button onClick={() => setQuery('How to manage morning sickness?')}>How to manage morning sickness?</button>
                <button onClick={() => setQuery('Is spotting normal at week 8?')}>Is spotting normal at week 8?</button>
                <button onClick={() => setQuery('IVF pregnancy precautions')}>IVF pregnancy precautions</button>
                <button onClick={() => setQuery('When is my first scan due?')}>When is my first scan due?</button>
              </div>
            </div>
          ) : (
            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-content">
                    {msg.role === 'assistant' ? renderAssistantMessage(msg.text, idx === 1) : msg.text}
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
              placeholder="Ask anything about your pregnancy..." 
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
            <span>For informational purposes only. Always consult your doctor.</span>
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

        .user-profile {
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
          background: #f1f8e9;
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
          background: var(--accent-primary);
          color: white;
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
          box-shadow: 0 4px 12px rgba(184, 102, 122, 0.2);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .new-thread:active { transform: scale(0.98); }

        .nav-group { flex: 1; overflow-y: auto; }
        .nav-group label {
          font-size: 11px;
          font-weight: 700;
          color: #b0a09e;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          display: block;
        }
        
        .recent-chats-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition);
        }

        .nav-item:hover { background: #fdf5f6; }
        .nav-item.active { background: #fdf1f3; color: var(--accent-primary); font-weight: 600; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

        .delete-conv-btn {
          background: transparent;
          border: none;
          color: #d32f2f;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        
        .nav-item:hover .delete-conv-btn {
          opacity: 0.7;
        }
        
        .delete-conv-btn:hover {
          opacity: 1 !important;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mini-profile { display: flex; align-items: center; gap: 10px; }
        .mini-avatar { font-size: 14px; }
        .mini-info h4 { font-size: 13px; font-weight: 600; }
        .mini-info p { font-size: 11px; color: var(--text-muted); }

        /* Main Content Styles */
        .content { flex: 1; display: flex; flex-direction: column; background: white; }

        .top-bar {
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f8f8f8;
        }

        .status h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #2e7d32;
          background: #f1f8e9;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .dot { width: 6px; height: 6px; background: #2e7d32; border-radius: 50%; }

        .top-actions { display: flex; gap: 8px; }
        .icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: var(--text-muted);
          background: transparent;
        }
        .icon-btn:hover { background: #f5f5f5; color: var(--text-main); }

        .view {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          overflow-y: auto;
        }

        .hero { max-width: 840px; width: 100%; text-align: center; }
        .hero-icon {
          width: 72px;
          height: 72px;
          background: #f1f8e9;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 32px;
        }

        .hero h1 { font-size: 42px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.02em; }
        .hero-text { font-size: 18px; color: var(--text-muted); line-height: 1.6; margin-bottom: 48px; }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
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
          box-shadow: 0 12px 30px rgba(0,0,0,0.04);
          transform: translateY(-4px);
        }

        .card-top { margin-bottom: 16px; }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .card p { font-size: 13px; color: var(--text-muted); }

        .suggestions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .suggestions button {
          background: white;
          border: 1px solid #eee;
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 14px;
          color: var(--text-main);
          cursor: pointer;
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
        
        .structured-response { display: flex; flex-direction: column; gap: 16px; }
        
        .structured-data-box {
          background: #f1f8e9;
          border-radius: 12px;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 13px;
          color: #2e7d32;
        }
        
        .data-row {
          display: flex;
          gap: 8px;
        }
        
        .data-row strong {
          opacity: 0.8;
          min-width: 120px;
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
