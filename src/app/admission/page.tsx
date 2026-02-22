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
  CheckCircle2,
  ShieldCheck
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

    try {
      // Updated payload mapping directly to your new backend schema
      const payload = {
        student_first_name: form.firstName,
        student_last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        class_grade: form.grade,
        learning_goal: form.targetExam, 
        guardian_name: form.guardianName,
        guardian_phone: form.guardianPhone,
        preferred_mode: form.preferredMode,
        address: form.address,
        notes: form.notes,
      };

      await studentApi.submitAdmission(payload);
      router.push('/admission/success');
    } catch (err: any) {
      console.error('Admission API error', err);
      const errorMsg = err?.response?.data?.detail || 'Failed to submit your application. Please check your details and try again.';

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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-[-15%] right-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-violet-500/30 blur-[100px] md:blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-cyan-400/20 blur-[100px] md:blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* Left Column: Value Proposition */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 space-y-8 md:space-y-10 animate-in slide-in-from-left-8 duration-700 fade-in text-white">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-8">
              <GraduationCap className="w-8 h-8 text-cyan-300" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Elevate your <br className="hidden lg:block"/>
              potential with <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">QubitGyan</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-indigo-100/90 leading-relaxed max-w-lg font-medium">
              Submit your application today. Join an elite learning ecosystem designed to transform your academic trajectory.
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-white/10">
            <FeatureItem title="Expertly Crafted Curriculum" desc="Rigorous, structured learning paths tailored for competitive success." />
            <FeatureItem title="Data-Driven Insights" desc="Real-time analytics to monitor your mastery and identify weak points." />
            <FeatureItem title="Hybrid Flexibility" desc="Seamlessly transition between our digital platform and physical classrooms." />
          </div>
        </div>

        {/* Right Column: Admission Form */}
        <div className="w-full lg:col-span-7 animate-in slide-in-from-right-8 duration-700 fade-in delay-150">
          <div className="w-full bg-white/95 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-2xl shadow-indigo-900/10 p-6 sm:p-8 md:p-10 lg:p-12">
            
            <div className="flex items-center gap-2 mb-8 text-indigo-600 bg-indigo-50 w-fit px-4 py-2 rounded-full border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide uppercase">Application Portal</span>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">

              {/* SECTION: Student Profile */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Student Profile</h2>
                </div>
              </div>

              <Field label="First Name" value={form.firstName} onChange={(value: string) => handleChange('firstName', value)} required />
              <Field label="Last Name" value={form.lastName} onChange={(value: string) => handleChange('lastName', value)} required />
              <Field label="Email Address" type="email" value={form.email} onChange={(value: string) => handleChange('email', value)} placeholder="student@example.com" required />
              <Field label="Phone Number" type="tel" value={form.phone} onChange={(value: string) => handleChange('phone', value)} placeholder="+91 98765 43210" required />

              {/* SECTION: Academic Goals */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-3 mb-1 mt-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Academic Goals</h2>
                </div>
              </div>

              <Field label="Current Grade / Class" value={form.grade} onChange={(value: string) => handleChange('grade', value)} placeholder="e.g. 12th Grade" required />
              <Field label="Target Exam" value={form.targetExam} onChange={(value: string) => handleChange('targetExam', value)} placeholder="e.g. JEE, NEET, Boards" required />

              <label className="md:col-span-2 block group">
                <span className="block text-sm font-bold text-slate-700 mb-2">Preferred Learning Mode <span className="text-rose-500">*</span></span>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 cursor-pointer"
                    value={form.preferredMode}
                    onChange={(event) => handleChange('preferredMode', event.target.value as AdmissionFormState['preferredMode'])}
                  >
                    <option value="Online">Online Sessions</option>
                    <option value="Offline">Offline / Classroom</option>
                    <option value="Hybrid">Hybrid (Best of both)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </label>

              {/* SECTION: Contact & Guardian */}
              <div className="md:col-span-2 flex items-center gap-4 border-b border-slate-100 pb-3 mb-1 mt-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Contact & Location</h2>
                </div>
              </div>

              <Field label="Guardian Name" value={form.guardianName} onChange={(value: string) => handleChange('guardianName', value)} placeholder="Parent/Guardian Name" required />
              <Field label="Guardian Phone" type="tel" value={form.guardianPhone} onChange={(value: string) => handleChange('guardianPhone', value)} placeholder="Emergency Contact" required />

              <label className="md:col-span-2 block">
                <span className="block text-sm font-bold text-slate-700 mb-2">Full Address <span className="text-rose-500">*</span></span>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 min-h-[100px] outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                  value={form.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                  placeholder="Enter your complete residential address..."
                  required
                />
              </label>

              <label className="md:col-span-2 block">
                <span className="block text-sm font-bold text-slate-700 mb-2">Additional Notes <span className="text-slate-400 font-normal">(Optional)</span></span>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 min-h-[80px] outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                  value={form.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  placeholder="Learning preferences, specific timing constraints, etc."
                />
              </label>

              {/* Submit Section */}
              <div className="md:col-span-2 mt-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-indigo-600 text-white font-bold py-4 md:py-5 text-lg hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Processing Application...</>
                  ) : (
                    <>Submit Application <SendHorizontal className="w-6 h-6" /></>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-5 text-sm font-medium text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Your information is encrypted and securely stored.</span>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------------- Helper Components ---------------------- */

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 p-1 bg-white/10 rounded-full border border-white/10">
        <CheckCircle2 className="w-5 h-5 text-cyan-300 shrink-0" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        <p className="text-base text-indigo-100/80 mt-1 leading-relaxed">{desc}</p>
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
    <label className="block group w-full">
      <span className="block text-sm font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
      />
    </label>
  );
}