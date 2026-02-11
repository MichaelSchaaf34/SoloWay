import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ImmersivePage } from '../components';

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/start" replace />;

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          email: form.email,
          password: form.password,
          displayName: form.displayName || undefined,
        });
      }
      navigate('/start', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Could not complete authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imageAlt="Night city viewed from a mountain lookout"
      imagePosition="center"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md bg-slate-900/75 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <Link to="/" className="text-teal-400 text-sm hover:text-teal-300">← Back to landing</Link>
        <h1 className="text-3xl font-bold mt-4">{mode === 'login' ? 'Welcome back' : 'Create your SoloWay account'}</h1>
        <div className="grid grid-cols-2 bg-slate-800 rounded-xl p-1 mt-6 mb-6">
          <button type="button" onClick={() => setMode('login')} className={`py-2 rounded-lg text-sm font-semibold ${mode === 'login' ? 'bg-teal-500 text-white' : 'text-slate-300'}`}>Login</button>
          <button type="button" onClick={() => setMode('register')} className={`py-2 rounded-lg text-sm font-semibold ${mode === 'register' ? 'bg-teal-500 text-white' : 'text-slate-300'}`}>Register</button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input type="text" placeholder="Display name" value={form.displayName} onChange={e => updateField('displayName', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          )}
          <input type="email" placeholder="Email" required value={form.email} onChange={e => updateField('email', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input type="password" placeholder="Password" required minLength={8} value={form.password} onChange={e => updateField('password', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold">
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </section>
    </ImmersivePage>
  );
};

export default Auth;
