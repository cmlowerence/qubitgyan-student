'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import  Link  from 'next/link';
import { 
  Loader2, 
  Lock, 
  UserRound, 
  Flame, 
  Trophy, 
  Clock, 
  ShieldCheck, 
  Mail, 
  CalendarDays,
  GraduationCap,
} from 'lucide-react';
import { changePassword, getMyProfile } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { ProfilePayload } from '@/lib/student-api';
import { cn } from '@/lib/utils';

interface ExtendedProfilePayload extends ProfilePayload {
  date_joined?: string; 
}

export default function ProfilePage() {
  const { showAlert } = useUi();

  const [profile, setProfile] = useState<ExtendedProfilePayload | null>(null);
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
      showAlert({ title: 'Update Failed', message: 'Please verify your current password and try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  const joinDate = profile?.date_joined 
    ? new Date(profile.date_joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : `January 2026`;

  return (
    <div className="relative min-h-screen font-sans pb-12">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50/20 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage your profile details, gamification stats, and security.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="h-36 md:h-48 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.15] mix-blend-overlay" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              </div>
              
              <div className="px-6 md:px-10 pb-10 relative">
                <div className="-mt-20 mb-5 relative inline-block">
                  <div className="w-36 h-36 rounded-full border-[6px] border-white bg-slate-50 shadow-xl shadow-indigo-900/10 overflow-hidden flex items-center justify-center relative z-10">
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Profile Avatar" 
                        width={144} 
                        height={144} 
                        unoptimized 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-400 flex items-center justify-center">
                        <UserRound className="w-14 h-14" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full z-20" title="Online" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl z-0" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight flex items-center gap-3">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <div className="inline-flex items-center gap-1.5 mt-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-100">
                      <GraduationCap className="w-3.5 h-3.5" /> Enrolled Student
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Member Since</p>
                      <p className="text-sm font-bold text-slate-700">{joinDate}</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard 
                label="Current Streak" 
                value={`${profile?.current_streak || 0} Days`} 
                icon={Flame} 
                color="text-orange-500" 
                bg="bg-orange-50" 
                borderColor="border-orange-100"
              />
              <StatCard 
                label="Longest Streak" 
                value={`${profile?.longest_streak || 0} Days`} 
                icon={Trophy} 
                color="text-amber-500" 
                bg="bg-amber-50" 
                borderColor="border-amber-100"
              />
              <StatCard 
                label="Learning Time" 
                value={`${profile?.total_learning_minutes || 0} Mins`} 
                icon={Clock} 
                color="text-blue-500" 
                bg="bg-blue-50" 
                borderColor="border-blue-100"
              />
            </section>

          </div>

          <div className="lg:col-span-5">
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:sticky lg:top-8">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Security</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Manage your credentials</p>
                </div>
              </div>

              <form onSubmit={updatePassword} className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2 pl-1">
                    <label className="block text-sm font-bold text-slate-700">Current Password</label>
                    <Link 
                      href="/forgot-password"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Enter current password" 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Create a new password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-4 font-bold hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 active:scale-[0.98]"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Updating Security...</>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}


function StatCard({ label, value, icon: Icon, color, bg, borderColor }: { label: string; value: string; icon: any; color: string; bg: string; borderColor: string; }) {
  return (
    <div className={cn("rounded-[1.5rem] border bg-white p-5 md:p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow group", borderColor)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", bg, color)}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl md:text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">{label}</p>
    </div>
  );
}