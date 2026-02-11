'use client';

import { useAuth } from '@/context/auth-context';
import { Award, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { ComponentType } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="grid lg:grid-cols-[1.2fr,1fr] gap-5 pb-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-2">Manage your academic identity and progress details.</p>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-5">
          <p className="text-sm text-slate-200">Student ID</p>
          <p className="text-2xl font-black mt-1">QG-{user?.id ?? '001'}</p>
          <p className="text-sm text-slate-300 mt-3">Profile updates and verification options will be connected to admin panel APIs later.</p>
        </div>
      </section>

      <section className="space-y-3">
        <InfoCard icon={UserRound} label="Full Name" value={`${user?.first_name || 'Student'} ${user?.last_name || ''}`.trim()} />
        <InfoCard icon={Mail} label="Email" value={user?.email || 'student@qubitgyan.com'} />
        <InfoCard icon={ShieldCheck} label="Account Status" value={user?.is_suspended ? 'Suspended' : 'Active'} />
        <InfoCard icon={Award} label="Level" value="Advanced Learner" />
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
          <p className="font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
