import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const TEAM_PASSWORDS: Record<string, string> = {
  tamu: 'tennis',
  texas: 'golf',
  michigan: 'court',
  uf: 'pickleball',
  uiuc: 'squash',
  uw: 'swimming',
  washu: 'badminton',
  ucsd: 'croquet',
  admin: 'chess',
  judge: 'yoga',
  reps: 'cycling',
};

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const match = Object.entries(TEAM_PASSWORDS).find(([, accessCode]) => accessCode === password);

    if (!match) {
      setError('Invalid access code. Please try again.');
      window.setTimeout(() => setError(''), 3000);
      return;
    }

    const portalId = match[0];
    sessionStorage.setItem('team', portalId);
    sessionStorage.setItem('portalRole', portalId === 'admin' || portalId === 'judge' || portalId === 'reps' ? portalId : 'team');
    navigate(portalId === 'admin' ? '/team-portal/admin' : '/team-portal/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center bg-cover bg-center stranger-portal-bg">
      <div className="max-w-md w-full mx-4">
        <button onClick={() => navigate('/')} className="mb-6 px-4 py-2 text-white/80 font-cormorant text-lg hover:text-white transition-colors duration-300 flex items-center group">
          <IoArrowBack className="mr-2 text-xl transition-transform duration-300 group-hover:-translate-x-1" />
          Step Away from the Portal
        </button>

        <div className="bg-black/60 backdrop-blur-lg p-8 rounded-lg border border-white/10">
          <p className="text-red-400/80 text-xs uppercase tracking-[0.45em] text-center mb-3">Restricted frequency</p>
          <h2 className="text-5xl md:text-6xl font-cormorant text-center text-white mb-8 stranger-heading">Enter the Portal</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="portal-access-code" className="block text-white font-cormorant text-xl mb-2">Enter Access Code</label>
              <input id="portal-access-code" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors placeholder-white/30" placeholder="••••••••" required />
            </div>

            {error && <div className="text-red-400 text-center font-cormorant text-lg" role="alert">{error}</div>}

            <button type="submit" className="w-full py-3 px-6 text-xl text-white font-cormorant bg-black/40 border border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-300 magical-border">Enter</button>
          </form>

          <div className="mt-8 text-center text-white/40 font-cormorant text-sm">“Admission by invitation only.”</div>
        </div>
      </div>
    </div>
  );
}
