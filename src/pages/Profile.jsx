import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ImmersivePage } from '../components';
import { getProfile } from '../utils/userService';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [isLoading, setIsLoading] = useState(true);

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
      </section>
    </ImmersivePage>
  );
};

export default Profile;
