import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Shield, User, Users, AlertCircle } from 'lucide-react';
import { Role, UserSession, Teacher, Student, Coordinator } from '../types';
import { supabase, isDemoMode } from '../supabase';
import { toAuthEmail, sanitizeLoginKey } from '../lib/authId';
import { toast } from 'sonner';

interface LoginProps {
  teachers: Teacher[];
  students: Student[];
  coordinators: Coordinator[];
  onLogin: (session: UserSession) => void;
  onBackToLanding?: () => void;
}

export default function Login({ teachers, students, coordinators, onLogin, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /**
   * AUTH: profiles row → UserSession.
   * ROLE ka source of truth ab SIRF `profiles` table hai (Supabase Auth + RLS).
   * Pehle koi bhi authenticated email auto-'principal' ban jata tha — privilege
   * escalation hole. Ab profile row na mile to login REJECT hota hai.
   */
  const buildSessionFromProfile = async (uid: string, loginInput: string, authEmail?: string): Promise<UserSession | null> => {
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('login_key, role, ref_id, display_name')
        .eq('id', uid)
        .maybeSingle();
      if (profErr || !prof?.role) return null;

      const role = prof.role as Role;
      const refId = prof.ref_id ? String(prof.ref_id) : undefined;
      const record: any =
        role === 'teacher' ? teachers.find(t => t.id === refId) :
        role === 'student' ? students.find(s => s.id === refId) :
        role === 'coordinator' ? coordinators.find(c => c.id === refId) : null;

      return {
        role,
        email: record?.email || authEmail || '',
        username: prof.login_key || sanitizeLoginKey(loginInput),
        id: refId,
        name: prof.display_name || record?.name || prof.login_key || loginInput,
      };
    } catch (e) {
      console.warn('[Auth] profile lookup failed:', e);
      return null;
    }
  };

  /**
   * LOCAL FALLBACK — demo mode ya offline device: record ke password se match
   * (cloud auth band/na-configured ho to bhi staff login kar sake). Principal/
   * developer ka koi local record nahi hota — wo sirf cloud auth se aate hain.
   */
  const matchLocalRecord = (input: string): UserSession | null => {
    const key = sanitizeLoginKey(input);
    const pick = (list: any[], role: Role) => {
      const rec = list.find(r =>
        sanitizeLoginKey(r.username) === key ||
        sanitizeLoginKey(r.id) === key ||
        (input.includes('@') && String(r.email || '').toLowerCase() === input.toLowerCase())
      );
      return rec && rec.password && rec.password === password ? { role, rec } : null;
    };
    const found = pick(coordinators, 'coordinator') || pick(teachers, 'teacher') || pick(students, 'student');
    if (!found) return null;
    const { role, rec } = found;
    return { role, email: rec.email || '', username: rec.username || rec.id, id: rec.id, name: rec.name };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input = email.trim();
    if (!input || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setBusy(true);
    try {
      // 1) AUTH FIRST — ID + Password (Supabase Auth). Login ID ka auth email banta hai:
      //    'teacher1' → 'teacher1@app.school' (fake-email pattern; user ko email nahi dikhta)
      if (!isDemoMode()) {
        const authEmail = toAuthEmail(input) || (input.includes('@') ? input.toLowerCase() : null);
        if (authEmail) {
          const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: authEmail, password });
          if (!authErr && data.user) {
            const session = await buildSessionFromProfile(data.user.id, input, authEmail);
            if (session) {
              onLogin(session);
              toast.success(`Welcome ${session.name}!`);
              return;
            }
            setError('Aap ka account kisi staff/student profile se linked nahi hai. Principal se rabta karein.');
            return;
          }
        }
      }

      // 2) LOCAL FALLBACK — device par maujood record ka password match
      const localSession = matchLocalRecord(input);
      if (localSession) {
        onLogin(localSession);
        toast.success(`Welcome ${localSession.name}!`);
        return;
      }

      setError('Invalid ID or Password. Portal access denied.');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 font-sans border-t-8 border-slate-900 dark:border-teal-600 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-sm space-y-12">

        {/* Minimalist Header */}
        <div className="text-center space-y-4">
          <img
            src="/logo.png"
            alt="DEMO ACADEMY"
            className="mx-auto h-20 w-auto object-contain mb-2"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h2 id="login-title" className="text-3xl font-light tracking-tighter text-slate-950 dark:text-white uppercase  text-center">
              Portal <span className="font-extrabold not-">Login</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] text-center">
              Demo School
            </p>
          </div>
        </div>

        {/* Unified Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          {error && (
            <div id="login-error" className="text-[10px] font-bold text-red-550 uppercase tracking-[0.2em] text-center bg-red-50 dark:bg-red-950/25 py-3 border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1">
              <input
                id="email-input"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login ID (e.g. teacher1)"
                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-4 text-[11px] font-bold tracking-[0.2em] focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-650"
              />
            </div>

            <div className="space-y-1 relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-4 text-[11px] font-bold tracking-[0.2em] focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-650"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              id="login-submit-btn"
              type="submit"
              disabled={busy}
              className="w-full py-4 bg-slate-950 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold text-[10px] uppercase tracking-[0.4em] transition-all cursor-pointer shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Signing In...' : 'Sign In to Portal'}
            </button>

            <div className="text-center">
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-950 uppercase tracking-[0.2em] border-b border-slate-100 transition-all cursor-pointer"
                >
                  Return to Overview
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-900 text-center">
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                Demo School Digital Management Infrastructure
            </p>
        </div>
      </div>
    </div>
  );
}
