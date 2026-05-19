'use client';

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Thermometer, 
  Syringe, 
  Calendar, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { MATERNITY_INFO_CARDS } from '@/utils/maternityData';

export default function InfoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const card = MATERNITY_INFO_CARDS.find((c) => c.id === params.id);

  if (!card) {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <ShieldAlert size={48} color="#d32f2f" />
          <h2>Information Page Not Found</h2>
          <p>The safety and guidance category you are looking for does not exist or has been moved.</p>
          <button onClick={() => router.push('/dashboard')} className="back-home-btn">
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
        <style jsx>{`
          .not-found-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--bg-primary);
            padding: 24px;
            font-family: inherit;
          }
          .not-found-card {
            background: white;
            padding: 40px;
            border-radius: var(--radius-lg);
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            text-align: center;
            max-width: 480px;
            width: 100%;
            border: 1px solid var(--card-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .not-found-card h2 {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-main);
          }
          .not-found-card p {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.6;
          }
          .back-home-btn {
            background: var(--accent-primary);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            box-shadow: 0 4px 12px rgba(184, 102, 122, 0.2);
          }
          .back-home-btn:hover {
            transform: translateY(-2px);
            opacity: 0.95;
          }
        `}</style>
      </div>
    );
  }

  const handleAskAI = (bulletText: string) => {
    const promptText = `Regarding ${card.title}, can you tell me more details or offer advice about this precaution: "${bulletText}"?`;
    sessionStorage.setItem('pending_maternity_query', promptText);
    router.push('/dashboard');
  };

  const handleAskGeneral = () => {
    const promptText = `Can you summarize the key safety precautions and guidance for ${card.title}?`;
    sessionStorage.setItem('pending_maternity_query', promptText);
    router.push('/dashboard');
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <button className="back-btn" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <div className="brand">🤰 MaternaAI Info hub</div>
      </header>

      {/* Hero Banner Section */}
      <div className="hero-section" style={{ backgroundColor: card.bgLight }}>
        <div className="hero-content">
          <div className="icon-wrapper" style={{ color: card.color, backgroundColor: 'white' }}>
            {card.iconName === 'Thermometer' && <Thermometer size={32} />}
            {card.iconName === 'Syringe' && <Syringe size={32} />}
            {card.iconName === 'Calendar' && <Calendar size={32} />}
          </div>
          <div className="hero-text-container">
            <span className="badge" style={{ color: card.color, borderColor: card.color + '40' }}>PREGNANCY KNOWLEDGE</span>
            <h1 className="title">{card.title}</h1>
            <p className="subtitle">{card.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content List */}
      <main className="content-container">
        <div className="guidelines-list">
          {card.bullets.map((bullet, idx) => (
            <div key={idx} className="bullet-card">
              <div className="bullet-number" style={{ color: card.color, backgroundColor: card.bgLight }}>
                {idx + 1}
              </div>
              <div className="bullet-text-section">
                <p className="bullet-body">{bullet}</p>
                <button 
                  className="ask-bubble" 
                  onClick={() => handleAskAI(bullet)}
                  title="Ask MaternaAI about this point"
                >
                  <Sparkles size={14} />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action card */}
        <div className="cta-card">
          <div className="cta-info">
            <Sparkles size={24} className="sparkle-icon" />
            <div>
              <h3>Have questions about these guidelines?</h3>
              <p>Ask our AI assistant to tailor this safety information specifically to your trimester, health profile, and symptoms.</p>
            </div>
          </div>
          <button className="cta-btn" onClick={handleAskGeneral}>
            <MessageSquare size={16} /> Talk to Maternity Assistant
          </button>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #faf6f4;
          font-family: inherit;
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          background: white;
          border-bottom: 1px solid var(--card-border);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 14px;
          background: transparent;
          border: 1px solid var(--card-border);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
        }
        .back-btn:hover {
          color: var(--text-main);
          border-color: var(--text-muted);
          background: var(--bg-primary);
        }

        .brand {
          font-weight: 700;
          color: var(--accent-primary);
          font-size: 14px;
          letter-spacing: 0.05em;
        }

        .hero-section {
          padding: 60px 40px;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: center;
        }

        .hero-content {
          max-width: 800px;
          width: 100%;
          display: flex;
          gap: 28px;
          align-items: center;
        }

        @media (max-width: 600px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          flex-shrink: 0;
        }

        .hero-text-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .badge {
          align-self: flex-start;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
          margin-bottom: 4px;
        }
        @media (max-width: 600px) {
          .badge {
            align-self: center;
          }
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .content-container {
          max-width: 800px;
          width: 100%;
          margin: 40px auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .guidelines-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bullet-card {
          background: white;
          padding: 20px 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          display: flex;
          gap: 20px;
          align-items: flex-start;
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }

        .bullet-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(184, 102, 122, 0.04);
          border-color: var(--accent-primary);
        }

        .bullet-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .bullet-text-section {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .bullet-text-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        .bullet-body {
          font-size: 15px;
          color: var(--text-main);
          line-height: 1.6;
        }

        .ask-bubble {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-primary);
          background: #fff5f7;
          border: 1px solid #ffe1e6;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .ask-bubble:hover {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          transform: scale(1.03);
        }

        .cta-card {
          background: linear-gradient(135deg, #fffbf9 0%, #fff5f2 100%);
          border: 1px solid #f3e9e4;
          padding: 32px;
          border-radius: var(--radius-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          box-shadow: 0 4px 20px rgba(184,102,122,0.03);
        }

        @media (max-width: 768px) {
          .cta-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            gap: 20px;
          }
          .cta-info {
            flex-direction: column;
            align-items: center;
          }
        }

        .cta-info {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          text-align: left;
        }

        @media (max-width: 768px) {
          .cta-info {
            text-align: center;
          }
        }

        .sparkle-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cta-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .cta-card p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .cta-btn {
          background: var(--accent-primary);
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 14px 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(184,102,122,0.2);
          white-space: nowrap;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(184,102,122,0.3);
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
}
