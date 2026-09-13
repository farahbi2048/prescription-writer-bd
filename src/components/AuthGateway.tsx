/** Login and registration screen for the clinician workspace. */
import { FormEvent, useState } from 'react';
import { ArrowRight, LoaderCircle, ShieldCheck, Stethoscope } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { BackendStatus, PORTFOLIO_DEMO_ENABLED } from '../config';

interface AuthGatewayProps {
  backendStatus: BackendStatus;
}

/** Switch between login and registration while sharing one submit handler. */
export default function AuthGateway({ backendStatus }: AuthGatewayProps) {
  const { login, register, enterDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /** Submit credentials through the authentication context. */
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') await login({ email, password });
      else await register({ fullName, email, password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not complete authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-5 flex items-center justify-center font-sans">
      <section className="w-full max-w-5xl rounded-3xl overflow-hidden bg-white shadow-2xl grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden md:flex p-10 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white flex-col justify-between">
          <div className="flex items-center gap-3"><span className="p-2 rounded-xl bg-white/15"><Stethoscope /></span><span className="font-bold">Prescription Writer BD</span></div>
          <div><p className="text-blue-100 text-sm font-semibold uppercase tracking-widest">Secure clinician workspace</p><h1 className="mt-3 text-4xl font-extrabold leading-tight">Documentation that stays under your control.</h1></div>
          <div className="flex items-center gap-2 text-sm text-blue-100"><ShieldCheck className="w-5 h-5" /> Password-protected doctor access</div>
        </div>
        <div className="p-7 sm:p-10">
          <div className="md:hidden flex items-center gap-2 text-blue-700 font-bold"><Stethoscope className="w-5 h-5" /> Prescription Writer BD</div>
          <p className="mt-6 text-sm text-slate-500">{mode === 'login' ? 'Welcome back' : 'Create your doctor account'}</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{mode === 'login' ? 'Sign in to your workspace' : 'Get started securely'}</h2>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' && <label className="block text-sm font-semibold text-slate-700">Full name<input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Dr. Your Name" /></label>}
            <label className="block text-sm font-semibold text-slate-700">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-600" placeholder="doctor@example.com" /></label>
            <label className="block text-sm font-semibold text-slate-700">Password<input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Minimum 8 characters" /></label>
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button disabled={submitting} className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:bg-slate-400">{submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}{mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
          {PORTFOLIO_DEMO_ENABLED && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={enterDemo}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100"
              >
                Try portfolio demo
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Synthetic records load immediately. Live backend: {backendStatus === 'online' ? 'ready' : backendStatus === 'starting' ? 'starting' : 'optional'}.
              </p>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-slate-600">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="font-bold text-blue-700 hover:underline">{mode === 'login' ? 'Register now' : 'Sign in'}</button></p>
        </div>
      </section>
    </main>
  );
}
