import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, FormField, ImmersivePage, Input } from '../components';
import { forgotPassword } from '../utils/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', sent: false });

  const handleSubmit = async event => {
    event.preventDefault();
    setStatus({ loading: true, error: '', sent: false });
    try {
      await forgotPassword(email);
      setStatus({ loading: false, error: '', sent: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Could not send reset email', sent: false });
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
        <Link to="/auth" className="text-sm text-slate-500 hover:text-slate-900">← Back to sign in</Link>
        <h1 className="mt-5 text-3xl font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your account email and we’ll send a one-time reset link.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField label="Email" required>
            <Input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
          </FormField>
          {status.error && <Alert tone="error">{status.error}</Alert>}
          {status.sent && <Alert tone="success">If that account exists, a reset link is on its way.</Alert>}
          <Button type="submit" variant="accent" size="lg" fullWidth loading={status.loading}>Send reset link</Button>
        </form>
      </section>
    </ImmersivePage>
  );
};

export default ForgotPassword;
