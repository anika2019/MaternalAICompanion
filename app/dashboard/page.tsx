'use client';

import { useState } from 'react';
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
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const [query, setQuery] = useState('');

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
              <h3>Anjali Mehta</h3>
              <p>Week 8 • 1st Trimester</p>
            </div>
          </div>
          <div className="tags">
            <span>Morning sickness</span>
            <span>PCOS history</span>
            <span>IVF pregnancy</span>
          </div>
        </div>

        <button className="new-thread">
          <Plus size={18} />
          New Conversation
        </button>

        <div className="nav-group">
          <label>RECENT CHATS</label>
          <div className="nav-item active">
            <MessageSquare size={16} />
            <span>Nutrition & Iron supplements</span>
          </div>
          <div className="nav-item">
            <MessageSquare size={16} />
            <span>Baby movement patterns</span>
          </div>
          <div className="nav-item">
            <MessageSquare size={16} />
            <span>Hospital bag checklist</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="mini-profile">
            <div className="mini-avatar">🌿</div>
            <div className="mini-info">
              <h4>Anjali Mehta</h4>
              <p>Week 8</p>
            </div>
          </div>
          <div className="footer-actions">
            <button className="icon-btn"><LogOut size={16} /></button>
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
          <div className="hero">
            <div className="hero-icon">🌿</div>
            <h1>Hello, Anjali!</h1>
            <p className="hero-text">
              I'm your personalized maternity assistant, adapted for your journey.<br />
              You're at <strong>Week 8</strong> — all my guidance is tailored to your profile.
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
                <p>Week 8 scans and what to expect</p>
              </div>
            </div>

            <div className="suggestions">
              <button>How to manage morning sickness?</button>
              <button>Is spotting normal at week 8?</button>
              <button>IVF pregnancy precautions</button>
              <button>When is my first scan due?</button>
            </div>
          </div>
        </div>

        <footer className="chat-dock">
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Ask anything about your pregnancy..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className={`send-btn ${query ? 'ready' : ''}`}>
              <Send size={20} />
            </button>
          </div>
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
        }

        .nav-group label {
          font-size: 11px;
          font-weight: 700;
          color: #b0a09e;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          display: block;
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
        }
        .suggestions button:hover { border-color: var(--accent-primary); color: var(--accent-primary); background: #fff5f7; }

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
