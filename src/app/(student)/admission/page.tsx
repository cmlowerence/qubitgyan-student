'use client';

import { useState } from 'react';
import { SendHorizontal, Loader2, GraduationCap } from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AdmissionFormState {
  firstName: string;
  lastName: string;
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
  firstName: '',
  lastName: '',
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
  const { showAlert } = useUi();
  const router = useRouter();
  const [form, setForm] = useState<AdmissionFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = <K extends keyof AdmissionFormState>(key: K, value: AdmissionFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        student_name: `${form.firstName} ${form.lastName}`.trim(),
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        class_grade: form.grade,
        learning_goal: `Exam: ${form.targetExam} | Mode: ${form.preferredMode} | Notes: ${form.notes}`,
      };

      await api.post('/public/admissions/', payload);

      router.push('/admission/success');
    } catch (err: any) {
      console.error('Admission API error', err);
      const errorMsg = err.response?.data?.detail || 'Failed to submit your application. Please try again later.';
      
      await showAlert({
        title: 'Submission Failed',
        message: errorMsg,
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-10 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-50 -z-10 -translate-y-1/2 translate-x-1/4" />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Student Admission Form</h1>
          <p className="text-slate-500 mt-2 text-lg">Apply to join QubitGyan and start your guided learning journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Section: Student Details */}
          <div className="md:col-span-2 text-sm font-bold text-violet-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
            Student Details
          </div>
          <Field label="First Name" value={form.firstName} onChange={(value) => handleChange('firstName', value)} required />
          <Field label="Last Name" value={form.lastName} onChange={(value) => handleChange('lastName', value)} required />
          <Field label="Email Address" type="email" value={form.email} onChange={(value) => handleChange('email', value)} required />
          <Field label="Phone Number" type="tel" value={form.phone} onChange={(value) => handleChange('phone', value)} required />

          {/* Section: Academic Info */}
          <div className="md:col-span-2 text-sm font-bold text-violet-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 mt-4">
            Academic Information
          </div>
          <Field label="Current Grade / Class" value={form.grade} onChange={(value) => handleChange('grade', value)} placeholder="e.g. 12th Grade, College Year 1" required />
          <Field label="Target Exam / Goal" value={form.targetExam} onChange={(value) => handleChange('targetExam', value)} placeholder="e.g. JEE, NEET, Board Exams" required />
          
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Preferred Learning Mode</span>
            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
              value={form.preferredMode}
              onChange={(event) => handleChange('preferredMode', event.target.value as AdmissionFormState['preferredMode'])}
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid (Both)</option>
            </select>
          </label>

          {/* Section: Guardian & Additional Info */}
          <div className="md:col-span-2 text-sm font-bold text-violet-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 mt-4">
            Additional Information
          </div>
          <Field label="Guardian Name" value={form.guardianName} onChange={(value) => handleChange('guardianName', value)} required />
          <Field label="Guardian Phone" type="tel" value={form.guardianPhone} onChange={(value) => handleChange('guardianPhone', value)} required />

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Full Address</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[80px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y"
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              required
            />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Additional Notes (Optional)</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[100px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y"
              value={form.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              placeholder="Learning preferences, timing constraints, or anything else we should know..."
            />
          </label>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="md:col-span-2 mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-bold py-4 hover:bg-violet-600 transition-all disabled:opacity-70 shadow-lg shadow-slate-900/10"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
            ) : (
              <>Submit Admission Request <SendHorizontal className="w-5 h-5" /></>
            )}
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
  placeholder = '',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
        required={required}
      />
    </label>
  );
}