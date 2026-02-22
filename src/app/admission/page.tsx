'use client';

import React, { useState } from 'react';
import {
  SendHorizontal,
  Loader2,
  GraduationCap,
  User,
  BookOpen,
  MapPin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import { studentApi } from '@/lib/student-api';
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

export default function AdmissionPage(): JSX.Element {
  const { showAlert } = useUi();
  const router = useRouter();
  const [form, setForm] = useState<AdmissionFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = <K extends keyof AdmissionFormState>(
    key: K,
    value: AdmissionFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const bridgeData = [
      `Exam: ${form.targetExam}`,
      `Mode: ${form.preferredMode}`,
      `Guardian: ${form.guardianName} (${form.guardianPhone})`,
      `Address: ${form.address}`,
      `Notes: ${form.notes || 'None'}`
    ].join(' | ');

    try {
      const payload = {
        student_first_name: form.firstName,
        student_last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        class_grade: form.grade,
        learning_goal: bridgeData,
      };

      await studentApi.submitAdmission(payload);
      router.push('/admission/success');
    } catch (err: any) {
      console.error('Admission API error', err);
      const errorMsg = err?.response?.data?.detail || 'Failed to submit your application. Please try again later.';

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[150px] pointer-events-none" />

      {/* Main container — reverted to lg breakpoint to match original behavior */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start min-w-0">
        {/* Left Column */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-12 space-y-6 sm:space-y-8 animate-in slide-in-from-left-8 duration-700 fade-in min-w-0">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-xl shadow-violet-900/10 mb-6 sm:mb-8 border border-slate-100">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Start your journey with <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">QubitGyan</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-600 leading-relaxed max-w-lg">
              Submit your admission request today. Our academic team will review your profile to ensure you get the absolute best learning experience.
            </p>
          </div>

          <div className="space-y-5 pt-4 sm:pt-6">
            <FeatureItem title="Expert Curriculum" desc="Structured learning paths designed for real results." />
            <FeatureItem title="Personalized Tracking" desc="Monitor your streak, progress, and performance." />
            <FeatureItem title="Flexible Learning Mode" desc="Choose between Online, Offline, or Hybrid classes." />
          </div>
        </div>

        {/* Right Column (Form) */}
        <div className="w-full lg:col-span-7 animate-in slide-in-from-right-8 duration-700 fade-in delay-150 min-w-0">
          <div className="w-full max-w-full bg-white/90 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-6 sm:p-8 lg:p-12 relative">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-8">

              {/* Student header */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Student Profile</h2>
                  <p className="text-sm text-slate-500 font-medium">Basic applicant information</p>
                </div>
              </div>

              <Field label="First Name" value={form.firstName} onChange={(value: string) => handleChange('firstName', value)} required />
              <Field label="Last Name" value={form.lastName} onChange={(value: string) => handleChange('lastName', value)} required />
              <Field label="Email Address" type="email" value={form.email} onChange={(value: string) => handleChange('email', value)} placeholder="student@example.com" required />
              <Field label="Phone Number" type="tel" value={form.phone} onChange={(value: string) => handleChange('phone', value)} placeholder="+91 98765 43210" required />

              {/* Academic header */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-4 mb-2 mt-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Academic Goals</h2>
                  <p className="text-sm text-slate-500 font-medium">What are you preparing for?</p>
                </div>
              </div>

              <Field label="Current Grade / Class" value={form.grade} onChange={(value: string) => handleChange('grade', value)} placeholder="e.g. 12th Grade" required />
              <Field label="Target Exam" value={form.targetExam} onChange={(value: string) => handleChange('targetExam', value)} placeholder="e.g. JEE, NEET, Boards" required />

              <label className="md:col-span-2">
                <span className="block text-sm sm:text-base font-bold text-slate-700 mb-2">Preferred Learning Mode <span className="text-rose-500">*</span></span>
                <div className="relative group">
                  <select
                    className="w-full appearance-none rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base text-slate-900"
                    value={form.preferredMode}
                    onChange={(event) => handleChange('preferredMode', event.target.value as AdmissionFormState['preferredMode'])}
                  >
                    <option value="Online">Online Sessions</option>
                    <option value="Offline">Offline / Classroom</option>
                    <option value="Hybrid">Hybrid (Best of both)</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </label>

              {/* Contact & Guardian header */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-4 mb-2 mt-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Contact & Guardian</h2>
                  <p className="text-sm text-slate-500 font-medium">Additional contact details</p>
                </div>
              </div>

              <Field label="Guardian Name" value={form.guardianName} onChange={(value: string) => handleChange('guardianName', value)} placeholder="Parent/Guardian Name" required />
              <Field label="Guardian Phone" type="tel" value={form.guardianPhone} onChange={(value: string) => handleChange('guardianPhone', value)} placeholder="Emergency Contact" required />

              <label className="md:col-span-2">
                <span className="block text-sm sm:text-base font-bold text-slate-700 mb-2">Full Address <span className="text-rose-500">*</span></span>
                <textarea
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 min-h-[120px] outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-y font-medium text-base text-slate-900 placeholder:text-slate-400"
                  value={form.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                  placeholder="Enter your complete residential address..."
                  required
                />
              </label>

              <label className="md:col-span-2">
                <span className="block text-sm sm:text-base font-bold text-slate-700 mb-2">Additional Notes <span className="text-slate-400 font-normal">(Optional)</span></span>
                <textarea
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 min-h-[100px] outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-y font-medium text-base text-slate-900 placeholder:text-slate-400"
                  value={form.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  placeholder="Learning preferences, specific timing constraints, or anything else we should know..."
                />
              </label>

              {/* Submit */}
              <div className="md:col-span-2 mt-6 pt-8 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-bold py-4 sm:py-5 text-lg hover:bg-violet-600 transition-all disabled:opacity-70 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Processing Application...</>
                  ) : (
                    <>Submit Admission Request <SendHorizontal className="w-6 h-6" /></>
                  )}
                </button>
                <p className="text-center text-sm text-slate-500 mt-5 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Secure and encrypted submission.
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------------- Helper components with proper types ---------------------- */

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm sm:text-base text-slate-600 mt-1">{desc}</p>
      </div>
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
    <label className="block">
      <span className="block text-sm sm:text-base font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base text-slate-900 placeholder:text-slate-400"
        required={required}
      />
    </label>
  );
}
