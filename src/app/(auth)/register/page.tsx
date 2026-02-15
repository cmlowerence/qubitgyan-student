'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import api from '@/lib/api';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function RegisterRequestPage() {
  const [form, setForm] = useState({ student_name: '', email: '', phone: '', class_level: '', goal: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await api.post('/public/admissions/', {
        student_name: form.student_name,
        email: form.email,
        phone: form.phone,
        class_grade: form.class_level,
        learning_goal: form.goal,
      });
      setMessage('Admission request sent. Admin will review and notify you by email.');
      setForm({ student_name: '', email: '', phone: '', class_level: '', goal: '' });
    } catch (err) {
      setMessage('Failed to submit. Your request is saved locally — try again later.');
      console.error('Admission submit failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8">
      <div className="flex flex-col items-center mb-6">
        <Logo theme="light" className="scale-90 mb-3" />
        <h1 className="text-2xl font-black text-slate-900">Request Student Admission</h1>
        <p className="text-sm text-slate-500 text-center mt-1">No account yet? Submit a request and wait for admin approval.</p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5" />
          {message}
        </div>
      )}

      <form className="space-y-3" onSubmit={onSubmit}>
        <Input label="Student Name" value={form.student_name} onChange={(v) => setForm((p) => ({ ...p, student_name: v }))} required />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} required />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} required />
        <Input label="Class / Grade" value={form.class_level} onChange={(v) => setForm((p) => ({ ...p, class_level: v }))} required />
        <Input label="Learning Goal" value={form.goal} onChange={(v) => setForm((p) => ({ ...p, goal: v }))} required />

        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit Request
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already approved?{' '}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="space-y-1 block">
      <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" required={required} />
    </label>
  );
}
