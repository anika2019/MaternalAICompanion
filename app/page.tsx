'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { signUpUser } from '@/app/actions/signup';
import { useRouter } from 'next/navigation';
const PROFILES = [
  { id: 1, name: 'Priya Sharma', status: 'Week 24 • 2nd Trimester', icon: '🌸', color: '#fce4ec', phone: '+91 98765 00001' },
  { id: 2, name: 'Anjali Mehta', status: 'Week 8 • 1st Trimester', icon: '🌿', color: '#f1f8e9', phone: '+91 98765 00002' },
  { id: 3, name: 'Sunita Rao', status: 'Week 36 • 3rd Trimester', icon: '🌼', color: '#fff9c4', phone: '+91 98765 00003' },
  { id: 4, name: 'Meera Joshi', status: 'Postpartum • 3 Weeks', icon: '🌙', color: '#e1f5fe', phone: '+91 98765 00004' },
];

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedProfile, setSelectedProfile] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState(PROFILES[1].phone);

  const [dynamicProfiles, setDynamicProfiles] = useState<any[]>(PROFILES);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        // Fetch from both tables separately to avoid foreign key join issues
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, full_name, phone_number');
        const { data: maternalData, error: maternalError } = await supabase.from('maternal_profiles').select('id, pregnancy_week, trimester, health_conditions, diet_type');

        if (profilesError) console.error("Error fetching profiles:", profilesError);
        if (maternalError) console.error("Error fetching maternal profiles:", maternalError);

        if (profilesData && profilesData.length > 0) {
          const colors = ['#fce4ec', '#f1f8e9', '#fff9c4', '#e1f5fe', '#f3e5f5'];
          const icons = ['🌸', '🌿', '🌼', '🌙', '⭐'];
          
          const mergedProfiles = profilesData.map((p, index) => {
            const mat = maternalData?.find(m => m.id === p.id) || ({} as any);
            let status = 'Unknown Status';
            if (mat.pregnancy_week && mat.trimester) {
              status = `Week ${mat.pregnancy_week} • ${mat.trimester.replace('_', ' ')}`;
            } else if (mat.trimester) {
              status = mat.trimester.replace('_', ' ');
            }
            
            return {
              id: p.id,
              name: p.full_name || 'Unknown',
              phone: p.phone_number || '',
              status: status,
              icon: icons[index % icons.length],
              color: colors[index % colors.length],
              maternalInfo: mat // Storing full data in case needed
            };
          });
          setDynamicProfiles(mergedProfiles);
          
          // Set initial selections if available
          if (mergedProfiles.length > 0) {
            setSelectedProfile(mergedProfiles[0].id);
            setPhoneNumber(mergedProfiles[0].phone);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      } finally {
        setIsLoadingProfiles(false);
      }
    }
    
    fetchProfiles();
  }, []);

  const [signUpName, setSignUpName] = useState('');
  const [signUpAge, setSignUpAge] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [pregnancyWeek, setPregnancyWeek] = useState('');
  const [trimester, setTrimester] = useState('first_trimester');
  const [healthConditions, setHealthConditions] = useState('');
  const [dietType, setDietType] = useState('Vegetarian');

  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signUpUser({
      full_name: signUpName,
      age: signUpAge,
      phone_number: signUpPhone,
      pregnancy_week: pregnancyWeek ? parseInt(pregnancyWeek) : undefined,
      trimester: trimester,
      health_conditions: healthConditions,
      diet_type: dietType,
    });

    if (!result.success) {
      alert(`Sign up error: ${result.error}`);
      return;
    }

    alert("Sign up successful! Taking you to the dashboard...");
    router.push('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber) {
      const dummyEmail = `${phoneNumber.replace(/\D/g, '')}@dummy.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: 'DummyPassword123!@#',
      });

      if (error) {
        alert(`Login failed: Please sign up first, or check your phone number.`);
      } else {
        router.push('/dashboard');
      }
    } else {
      alert('Please enter your phone number.');
    }
  };

  const handleProfileClick = (id: any) => {
    setSelectedProfile(id);
    const profile = dynamicProfiles.find(p => p.id === id);
    if (profile) setPhoneNumber(profile.phone);
  };

  return (
    <main className="login-wrapper">
      <div className="login-card">
        {authMode === 'login' ? (
          <>
            <div className="profile-selection">
              <div className="grid">
                {isLoadingProfiles ? (
                  <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>Loading profiles...</p>
                ) : dynamicProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`profile-card ${selectedProfile === profile.id ? 'active' : ''}`}
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <div className="profile-icon" style={{ backgroundColor: profile.color }}>
                      {profile.icon}
                    </div>
                    <div className="profile-info">
                      <h3>{profile.name}</h3>
                      <p>{profile.status}</p>
                      <p className="phone-number">{profile.phone}</p>
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
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>

              <button type="button" onClick={handleLogin} className="primary-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px', width: '100%' }}>
                Log In
              </button>

              <div className="toggle-auth" style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '500' }}>
                <span onClick={() => setAuthMode('signup')}>New user? Sign up</span>
              </div>
            </div>
          </>
        ) : (
          <div className="auth-form">
            <h2 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-main)' }}>Create an Account</h2>
            <div className="field">
              <label>Name</label>
              <input type="text" placeholder="Your full name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} />
            </div>
            <div className="field">
              <label>Age</label>
              <input type="number" placeholder="e.g. 28" value={signUpAge} onChange={(e) => setSignUpAge(e.target.value)} />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input type="tel" placeholder="+91 98765 43210" value={signUpPhone} onChange={(e) => setSignUpPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Pregnancy Week</label>
              <input type="number" placeholder="e.g. 12" value={pregnancyWeek} onChange={(e) => setPregnancyWeek(e.target.value)} />
            </div>
            <div className="field">
              <label>Trimester</label>
              <select style={{ background: 'var(--input-field)', border: '1px solid transparent', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '15px' }} value={trimester} onChange={(e) => setTrimester(e.target.value)}>
                <option>first_trimester</option>
                <option>second_trimester</option>
                <option>third_trimester</option>
                <option>postpartum</option>
              </select>
            </div>
            <div className="field">
              <label>Health Conditions</label>
              <input type="text" placeholder="e.g. Gestational Diabetes" value={healthConditions} onChange={(e) => setHealthConditions(e.target.value)} />
            </div>
            <div className="field">
              <label>Diet Type</label>
              <select style={{ background: 'var(--input-field)', border: '1px solid transparent', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '15px' }} value={dietType} onChange={(e) => setDietType(e.target.value)}>
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
              </select>
            </div>

            <button type="button" onClick={handleSignUp} className="primary-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px', width: '100%' }}>
              Sign Up
            </button>

            <div className="toggle-auth" style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '500' }}>
              <span onClick={() => setAuthMode('login')}>Already have an account? Sign in</span>
            </div>
          </div>
        )}

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
