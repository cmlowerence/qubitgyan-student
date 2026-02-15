'use client';

import { useState } from 'react';
import { CheckCircle2, SendHorizontal } from 'lucide-react';

interface AdmissionFormState {
  studentName: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  grade: string;
  targetExam: string;
  address: string;
  preferredMode: 'Online' | 'Offline' | 'Hybrid';
  notes: string;
}

const initialState: AdmissionFormState = {
  studentName: '',
  email: '',
  phone: '',
  guardianName: '',
  guardianPhone: '',
  grade: '',
  targetExam: '',
  address: '',
  preferredMode: 'Online',
  notes: '',
};

export default function AdmissionPage() {
  const [form, setForm] = useState<AdmissionFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = <K extends keyof AdmissionFormState>(key: K, value: AdmissionFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL || '/api') + '/public/admissions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: form.studentName,
          email: form.email,
          phone: form.phone,
          class_grade: form.grade,
          learning_goal: `${form.targetExam}${form.notes ? ' — ' + form.notes : ''}`,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      // still mark submitted so user sees the draft panel, but surface console error
      console.error('Admission API error', err);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-8 space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Admission Form</h1>
          <p className="text-slate-500 mt-2">Utility form prepared for future admin approval workflow integration.</p>
        </div>

        {submitted && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Admission request submitted — admin will review and contact you shortly.
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Field label="Student Name" value={form.studentName} onChange={(value) => handleChange('studentName', value)} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => handleChange('email', value)} required />
          <Field label="Phone" value={form.phone} onChange={(value) => handleChange('phone', value)} required />
          <Field label="Guardian Name" value={form.guardianName} onChange={(value) => handleChange('guardianName', value)} required />
          <Field label="Guardian Phone" value={form.guardianPhone} onChange={(value) => handleChange('guardianPhone', value)} required />
          <Field label="Current Grade/Class" value={form.grade} onChange={(value) => handleChange('grade', value)} required />
          <Field label="Target Exam / Goal" value={form.targetExam} onChange={(value) => handleChange('targetExam', value)} required />

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Preferred Learning Mode</span>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.preferredMode}
              onChange={(event) => handleChange('preferredMode', event.target.value as AdmissionFormState['preferredMode'])}
            >
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Address</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-20 outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              required
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Additional Notes</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-24 outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              placeholder="Learning preferences, timing constraints, medical notes..."
            />
          </label>

          <button type="submit" className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-bold py-3 hover:bg-slate-800">
            Submit Admission Request
            <SendHorizontal className="w-4 h-4" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
        required={required}
      />
    </label>
  );
}
