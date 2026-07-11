import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, ImmersivePage } from '../components';
import { verifyEmail } from '../utils/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState({ loading: true, error: '', complete: false });

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!token) {
        setStatus({ loading: false, error: 'This verification link is invalid.', complete: false });
        return;
      }
      try {
        await verifyEmail(token);
        if (active) setStatus({ loading: false, error: '', complete: true });
      } catch (error) {
        if (active) setStatus({ loading: false, error: error.message || 'Could not verify email', complete: false });
      }
    }
    verify();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2200&auto=format&fit=crop"
      tone="light"
      contentClassName="flex min-h-screen items-center justify-center px-6 py-24"
    >
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Email verification</h1>
        {status.loading && <p className="mt-4 text-slate-500">Verifying your secure link…</p>}
        {status.complete && <Alert tone="success" className="mt-6">Your email is verified. You can now sign in.</Alert>}
        {status.error && <Alert tone="error" className="mt-6">{status.error}</Alert>}
        {!status.loading && <Button as={Link} to="/auth" variant="accent" size="lg" fullWidth className="mt-6">Go to sign in</Button>}
      </section>
    </ImmersivePage>
  );
};

export default VerifyEmail;
