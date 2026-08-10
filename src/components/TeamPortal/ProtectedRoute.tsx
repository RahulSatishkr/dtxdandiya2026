import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { auth, db } from '../../config/firebase';

type PortalRole = 'admin' | 'team' | 'judge' | 'reps' | 'liaison';

export default function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: PortalRole[] }) {
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const allowedRolesKey = allowedRoles.join('|');

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      sessionStorage.removeItem('team');
      sessionStorage.removeItem('portalRole');
      setAccess('denied');
      return;
    }

    try {
      const snapshot = await get(ref(db, `users/${user.uid}`));
      if (!snapshot.exists()) throw new Error('Missing portal profile');
      const profile = snapshot.val() as { role: PortalRole; teamId?: string };
      if (!allowedRoles.includes(profile.role)) throw new Error('Role not allowed');
      const portalId = profile.role === 'team' || profile.role === 'liaison' ? profile.teamId : profile.role;
      if (!portalId) throw new Error('Missing team assignment');
      sessionStorage.setItem('team', portalId);
      sessionStorage.setItem('portalRole', profile.role);
      setAccess('allowed');
    } catch {
      sessionStorage.removeItem('team');
      sessionStorage.removeItem('portalRole');
      setAccess('denied');
    }
  }), [allowedRolesKey]);

  if (access === 'checking') return <div className="min-h-screen bg-black grid place-items-center text-white/60">Opening portal…</div>;
  if (access === 'denied') return <Navigate to="/team-portal/login" replace />;
  return children;
}
