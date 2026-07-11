import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { resendVerification } from '../utils/authService';
import {
  Alert,
  Button,
  FormField,
  ImmersivePage,
  Input,
} from '../components';

const PASSWORD_RULE_TEXT = '12+ characters with upper, lower, number, and symbol';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedPath = typeof location.state?.from === 'string'
    && location.state.from.startsWith('/')
    && !location.state.from.startsWith('//')
    ? location.state.from
    : '/start';

  if (isAuthenticated) return <Navigate to={requestedPath} replace />;

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        navigate(requestedPath, { replace: true });
      } else {
        const result = await register({
          email: form.email,
          password: form.password,
          displayName: form.displayName || undefined,
        });
        if (result?.requiresEmailVerification) {
          setSuccess('Check your inbox for a verification link, then return here to sign in.');
          setMode('login');
          setForm(prev => ({ ...prev, password: '' }));
        }
      }
    } catch (submitError) {
      setError(submitError.message || 'Could not complete authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegister = mode === 'register';
  const needsVerification = error.toLowerCase().includes('verify your email');

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await resendVerification(form.email);
      setSuccess('If this account still needs verification, a new link has been sent.');
    } catch (resendError) {
      setError(resendError.message || 'Could not resend verification email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      imageAlt="Night city viewed from a mountain lookout"
      imagePosition="center"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md bg-white/90 border border-white/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <Link
          to="/"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Back to landing
        </Link>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 mb-1.5">
            {isRegister ? 'Join SoloWay' : 'Welcome back'}
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {isRegister
              ? 'One account for itineraries, safety, and buddy invites.'
              : 'Pick up where you left off.'}
          </p>
        </div>

        <div
          className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mt-6 mb-6"
          role="tablist"
          aria-label="Authentication mode"
        >
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <FormField label="Display name">
              <Input
                type="text"
                placeholder="What should we call you?"
                value={form.displayName}
                onChange={e => updateField('displayName', e.target.value)}
                autoComplete="name"
              />
            </FormField>
          )}

          <FormField label="Email" required>
            <Input
              type="email"
              placeholder="you@traveler.com"
              required
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </FormField>

          <FormField
            label="Password"
            required
            hint={isRegister ? PASSWORD_RULE_TEXT : undefined}
          >
            <Input
              type="password"
              placeholder="••••••••••••"
              required
              minLength={isRegister ? 12 : 1}
              value={form.password}
              onChange={e => updateField('password', e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </FormField>

          {!isRegister && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-teal-700 hover:text-teal-900">
                Forgot password?
              </Link>
            </div>
          )}

          {error && <Alert tone="error">{error}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}
          {needsVerification && (
            <Button type="button" variant="secondary" fullWidth onClick={handleResend} loading={isSubmitting}>
              Resend verification email
            </Button>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconRight={isSubmitting ? undefined : ArrowRight}
          >
            {isRegister ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-slate-500 hover:text-slate-900 underline underline-offset-2">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-slate-500 hover:text-slate-900 underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </section>
    </ImmersivePage>
  );
};

export default Auth;
