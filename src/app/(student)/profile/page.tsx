'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Loader2, Lock, UserRound } from 'lucide-react';
import { changePassword, getMyProfile } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { ProfilePayload } from '@/lib/student-api';

export default function ProfilePage() {
  const { showAlert } = useUi();

  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProfile(await getMyProfile());
      setLoading(false);
    };

    load();
  }, []);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!oldPassword || !newPassword) {
      showAlert({ title: 'Missing fields', message: 'Enter both current and new password.', variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      showAlert({ title: 'Password updated', message: 'Your password has been changed successfully.', variant: 'success' });
    } catch {
      showAlert({ title: 'Could not update password', message: 'Please verify your current password and try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {profile?.avatar_url ? (
          <Image src={profile.avatar_url} alt="avatar" width={72} height={72} className="rounded-full object-cover" />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-indigo-100 text-indigo-600 grid place-items-center">
            <UserRound className="w-8 h-8" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-slate-900">{profile?.first_name} {profile?.last_name}</h1>
          <p className="text-sm text-slate-500 mt-1">{profile?.email}</p>
          <p className="text-xs text-slate-400 mt-2">Username: {profile?.username}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-black text-slate-900">Gamification Stats</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <Stat label="Current streak" value={String(profile?.current_streak || 0)} />
          <Stat label="Longest streak" value={String(profile?.longest_streak || 0)} />
          <Stat label="Learning minutes" value={String(profile?.total_learning_minutes || 0)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2"><Lock className="w-5 h-5" />Change Password</h2>
        <form onSubmit={updatePassword} className="mt-4 grid sm:grid-cols-2 gap-3">
          <input type="password" placeholder="Current password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <button type="submit" disabled={saving} className="sm:col-span-2 rounded-xl bg-slate-900 text-white py-2.5 text-sm font-bold disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-slate-500">{label}</p>
      <p className="font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}
