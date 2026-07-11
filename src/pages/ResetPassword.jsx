import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, FormField, ImmersivePage, Input } from '../components';
import { resetPassword } from '../utils/authService';

const PASSWORD_RULE_TEXT = '12+ characters with upper, lower, number, and symbol';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, error: '', complete: false });

  const handleSubmit = async event => {
    event.preventDefault();
    if (!token) {
      setStatus({ loading: false, error: 'This reset link is invalid.', complete: false });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', complete: false });
      return;
    }

    setStatus({ loading: true, error: '', complete: false });
    try {
      await resetPassword(token, form.password);
      setStatus({ loading: false, error: '', complete: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Could not reset password', complete: false });
    }
  };

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Choose a new password</h1>
        {status.complete ? (
          <div className="mt-6 space-y-4">
            <Alert tone="success">Your password has been updated. All existing sessions were signed out.</Alert>
            <Button as={Link} to="/auth" variant="accent" size="lg" fullWidth>Return to sign in</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FormField label="New password" hint={PASSWORD_RULE_TEXT} required>
              <Input type="password" value={form.password} onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))} autoComplete="new-password" minLength={12} required />
            </FormField>
            <FormField label="Confirm password" required>
              <Input type="password" value={form.confirmPassword} onChange={event => setForm(prev => ({ ...prev, confirmPassword: event.target.value }))} autoComplete="new-password" minLength={12} required />
            </FormField>
            {status.error && <Alert tone="error">{status.error}</Alert>}
            <Button type="submit" variant="accent" size="lg" fullWidth loading={status.loading}>Update password</Button>
          </form>
        )}
      </section>
    </ImmersivePage>
  );
};

export default ResetPassword;
