'use client';

import { useEffect, useState } from 'react';
import { getMyProfile, changePassword } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { useAuth } from '@/context/auth-context';
import { Flame, Trophy, Clock, Lock, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizHistory } from '@/components/student/quiz-history';

interface ProfileData {
  username: string;
  email: string;
  first_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_learning_minutes: number;
  last_active_date: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { showAlert } = useUi();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password Form State
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getMyProfile();
      if (data) setProfile(data);
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      await showAlert({ title: 'Mismatch', message: 'New passwords do not match.', variant: 'error' });
      return;
    }

    setIsChangingPwd(true);
    try {
      await changePassword(pwdForm.old, pwdForm.new);
      await showAlert({ title: 'Success', message: 'Your password has been securely updated.', variant: 'success' });
      setPwdForm({ old: '', new: '', confirm: '' }); // Clear form
    } catch (error: any) {
      // Handle Django's specific error payload
      const errorMsg = error.response?.data?.old_password?.[0] || error.response?.data?.new_password?.[0] || 'Failed to update password.';
      await showAlert({ title: 'Update Failed', message: errorMsg, variant: 'error' });
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (isLoading) {
    return <div className="p-20 flex justify-center text-violet-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  if (!profile) return null;

  const hours = Math.floor(profile.total_learning_minutes / 60);
  const minutes = profile.total_learning_minutes % 60;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header Profile Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-violet-500/20 shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile.first_name.charAt(0) || 'S'
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900">{profile.first_name}</h1>
          <p className="text-slate-500 mt-1 font-medium">{profile.email}</p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-700 font-bold shrink-0">
          <ShieldCheck className="w-6 h-6" /> Active Student
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gamification Stats */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 px-1">Your Learning Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Streak</p>
              <p className="text-3xl font-black text-slate-900">{profile.current_streak} <span className="text-lg text-slate-400 font-medium">Days</span></p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Longest Streak</p>
              <p className="text-3xl font-black text-slate-900">{profile.longest_streak} <span className="text-lg text-slate-400 font-medium">Days</span></p>
            </div>

            <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Time Learning</p>
                <p className="text-3xl font-black text-slate-900">
                  {hours > 0 && `${hours}h `}{minutes}m
                </p>
              </div>
            </div>

          </div>
        </section>
        {/* Quiz History */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 px-1">Quiz History</h2>
          <QuizHistory />
        </section>
        {/* Security / Password */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 px-1">Account Security</h2>
          <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={pwdForm.old}
                  onChange={(e) => setPwdForm({...pwdForm, old: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none" 
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={pwdForm.new}
                onChange={(e) => setPwdForm({...pwdForm, new: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none mb-4" 
                placeholder="Must be at least 8 characters"
              />
              
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({...pwdForm, confirm: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none" 
                placeholder="Re-type new password"
              />
            </div>

            <button 
              type="submit"
              disabled={isChangingPwd}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600 transition-all disabled:opacity-70 mt-2"
            >
              {isChangingPwd ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}