'use client';

import { useState } from 'react';
import Link from 'next/link';

const PROFILES = [
  { id: 1, name: 'Priya Sharma', status: 'Week 24 • 2nd Trimester', icon: '🌸', color: '#fce4ec' },
  { id: 2, name: 'Anjali Mehta', status: 'Week 8 • 1st Trimester', icon: '🌿', color: '#f1f8e9' },
  { id: 3, name: 'Sunita Rao', status: 'Week 36 • 3rd Trimester', icon: '🌼', color: '#fff9c4' },
  { id: 4, name: 'Meera Joshi', status: 'Postpartum • 3 Weeks', icon: '🌙', color: '#e1f5fe' },
];

export default function LoginPage() {
  const [selectedProfile, setSelectedProfile] = useState(2);

  return (
    <main className="login-wrapper">
      <div className="login-card">
        <div className="profile-selection">
          <div className="grid">
            {PROFILES.map((profile) => (
              <div 
                key={profile.id}
                className={`profile-card ${selectedProfile === profile.id ? 'active' : ''}`}
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="profile-icon" style={{ backgroundColor: profile.color }}>
                  {profile.icon}
                </div>
                <div className="profile-info">
                  <h3>{profile.name}</h3>
                  <p>{profile.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider">
          <span>or sign in manually</span>
        </div>

        <div className="auth-form">
          <div className="field">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" defaultValue="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" defaultValue="password123" />
          </div>

          <Link href="/dashboard" className="primary-btn">
            Continue to MaternaAI
          </Link>
        </div>

        <div className="demo-footer">
          <span className="lock-icon">🔒</span>
          <p>This is a demo. No real data is stored or processed.</p>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-primary);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: white;
          padding: 48px 40px;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 60px rgba(74, 55, 54, 0.05);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .profile-card {
          padding: 24px 16px;
          border-radius: var(--radius-md);
          background: #fdfaf8;
          border: 2px solid transparent;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .profile-card:hover {
          transform: translateY(-4px);
          border-color: #f0e0d8;
        }

        .profile-card.active {
          background: #fff5f7;
          border-color: var(--accent-primary);
          box-shadow: 0 8px 24px rgba(184, 102, 122, 0.1);
        }

        .profile-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 12px;
        }

        .profile-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .profile-info p {
          font-size: 12px;
          color: var(--text-muted);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 32px 0;
          color: #d0c0bc;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eee;
        }

        .divider span {
          padding: 0 16px;
          font-size: 13px;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 14px;
          font-weight: 500;
        }

        .field input {
          background: var(--input-field);
          border: 1px solid transparent;
          padding: 16px;
          border-radius: var(--radius-sm);
          font-size: 15px;
          transition: var(--transition);
        }

        .field input:focus {
          border-color: var(--accent-primary);
          background: white;
        }

        .primary-btn {
          background: var(--accent-primary);
          color: white;
          text-align: center;
          padding: 16px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          text-decoration: none;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(184, 102, 122, 0.2);
        }

        .primary-btn:hover {
          background: #a35568;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(184, 102, 122, 0.3);
        }

        .demo-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .lock-icon {
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}
