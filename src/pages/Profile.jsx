import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Alert, Button, FormField, ImmersivePage, Input } from '../components';
import { getProfile } from '../utils/userService';
import { changePassword } from '../utils/authService';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await getProfile();
        const data = response?.data?.user || response?.user || user;
        if (mounted) setProfile(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handlePasswordChange = async event => {
    event.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordStatus({
        loading: false,
        error: '',
        success: 'Password updated. Other sessions have been signed out.',
      });
    } catch (error) {
      setPasswordStatus({
        loading: false,
        error: error.message || 'Could not update password',
        success: '',
      });
    }
  };

  if (isLoading) {
    return (
      <ImmersivePage
        imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2200&auto=format&fit=crop"
        imagePosition="center"
        tone="light"
        contentClassName="flex min-h-screen items-center justify-center"
      >
        Loading your profile...
      </ImmersivePage>
    );
  }

  return (
    <ImmersivePage
      imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2200&auto=format&fit=crop"
      imagePosition="center"
      tone="light"
      contentClassName="px-6 py-20"
    >
      <section className="max-w-3xl mx-auto bg-white/82 border border-white/80 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="text-teal-700 text-sm hover:text-teal-800">← Back to landing</Link>
            <h1 className="text-3xl font-bold mt-3">Your SoloWay Profile</h1>
          </div>
          <button onClick={handleLogout} className="px-5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800">Log out</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <div className="bg-white/90 border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500 uppercase">Display name</p><p className="text-lg mt-1">{profile?.displayName || 'Not set'}</p></div>
          <div className="bg-white/90 border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500 uppercase">Email</p><p className="text-lg mt-1">{profile?.email || 'Not available'}</p></div>
          <div className="bg-white/90 border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500 uppercase">Visibility</p><p className="text-lg mt-1">{profile?.visibilityMode || 'visible'}</p></div>
          <div className="bg-white/90 border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-500 uppercase">Member since</p><p className="text-lg mt-1">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</p></div>
        </div>
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/80 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Experience providers</h2>
          <p className="mt-1 text-sm text-slate-600">Onboard securely with Stripe Connect and publish bookable activities.</p>
          <Button as={Link} to="/provider/onboarding" variant="secondary" className="mt-4">Open provider tools</Button>
        </div>
        <form onSubmit={handlePasswordChange} className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-5">
          <h2 className="text-xl font-semibold text-slate-900">Change password</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Current password" required>
              <Input type="password" value={passwordForm.currentPassword} onChange={event => setPasswordForm(prev => ({ ...prev, currentPassword: event.target.value }))} autoComplete="current-password" required />
            </FormField>
            <FormField label="New password" hint="12+ characters with upper, lower, number, and symbol" required>
              <Input type="password" value={passwordForm.newPassword} onChange={event => setPasswordForm(prev => ({ ...prev, newPassword: event.target.value }))} autoComplete="new-password" minLength={12} required />
            </FormField>
          </div>
          {passwordStatus.error && <Alert tone="error" className="mt-4">{passwordStatus.error}</Alert>}
          {passwordStatus.success && <Alert tone="success" className="mt-4">{passwordStatus.success}</Alert>}
          <Button type="submit" variant="accent" className="mt-4" loading={passwordStatus.loading}>Update password</Button>
        </form>
      </section>
    </ImmersivePage>
  );
};

export default Profile;
