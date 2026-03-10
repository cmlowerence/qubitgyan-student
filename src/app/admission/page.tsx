'use client';

import React, { useState } from 'react';
import {
  SendHorizontal,
  Loader2,
  GraduationCap,
  User,
  BookOpen,
  MapPin,
  UserRoundPlus,
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
    } catch (error) {
      console.error('Admission API error', error);
      const err = error as { response?: { data?: { detail?: string } } };
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
    <div className="min-h-[100dvh] relative font-sans text-slate-900 z-0">
      
      {/* FIXED Background Layer */}
      <div className="fixed inset-0 -z-10 bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-[60vh] lg:h-full lg:w-[45%] bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[400px] lg:w-[600px] h-[300px] md:h-[400px] lg:h-[600px] rounded-full bg-violet-500/20 blur-[80px] md:blur-[100px] lg:blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[250px] md:w-[300px] lg:w-[500px] h-[250px] md:h-[300px] lg:h-[500px] rounded-full bg-cyan-400/20 blur-[80px] md:blur-[100px] lg:blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-20 items-start">
        
        {/* Left Column: Value Proposition */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 space-y-6 sm:space-y-8 md:space-y-10 animate-in slide-in-from-left-8 duration-700 fade-in text-white pt-4 lg:pt-0">
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-4 sm:mb-8">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] md:leading-[1.1]">
              Elevate your <br className="hidden sm:block"/>
              potential with <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">QubitGyan</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-indigo-100/90 leading-relaxed max-w-md lg:max-w-lg font-medium mx-auto lg:mx-0">
              Submit your application today. Join an elite learning ecosystem designed to transform your academic trajectory.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-4 border-t border-white/10">
            <FeatureItem title="Expertly Crafted Curriculum" desc="Rigorous, structured learning paths tailored for competitive success." />
            <FeatureItem title="Data-Driven Insights" desc="Real-time analytics to monitor your mastery and identify weak points." />
            <FeatureItem title="Hybrid Flexibility" desc="Seamlessly transition between our digital platform and physical classrooms." />
          </div>
        </div>

        {/* Right Column: Admission Form */}
        <div className="w-full lg:col-span-7 animate-in slide-in-from-right-8 duration-700 fade-in delay-150">
          <div className="w-full bg-white/95 backdrop-blur-3xl rounded-3xl sm:rounded-[2rem] border border-white/60 shadow-2xl shadow-indigo-900/10 p-5 sm:p-8 md:p-10 lg:p-12">
            
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-6 sm:mb-8 text-indigo-600 bg-indigo-50 w-full sm:w-fit px-4 py-2 sm:py-2.5 rounded-full border border-indigo-100">
              <UserRoundPlus className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">Application Portal</span>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">

              {/* SECTION: Student Profile */}
              <SectionHeader icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />} title="Student Profile" />
              <Field label="First Name" value={form.firstName} onChange={(val) => handleChange('firstName', val)} required />
              <Field label="Last Name" value={form.lastName} onChange={(val) => handleChange('lastName', val)} required />
              <Field label="Email Address" type="email" value={form.email} onChange={(val) => handleChange('email', val)} placeholder="student@example.com" required />
              <Field label="Phone Number" type="tel" value={form.phone} onChange={(val) => handleChange('phone', val)} placeholder="+91 98765 43210" required />

              {/* SECTION: Academic Goals */}
              <SectionHeader icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />} title="Academic Goals" />
              <Field label="Current Grade / Class" value={form.grade} onChange={(val) => handleChange('grade', val)} placeholder="e.g. 12th Grade" required />
              <Field label="Target Exam" value={form.targetExam} onChange={(val) => handleChange('targetExam', val)} placeholder="e.g. JEE, NEET, Boards" required />

              <label className="md:col-span-2 block group">
                <span className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">Preferred Learning Mode <span className="text-rose-500">*</span></span>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm sm:text-base font-medium text-slate-800 cursor-pointer"
                    value={form.preferredMode}
                    onChange={(e) => handleChange('preferredMode', e.target.value as AdmissionFormState['preferredMode'])}
                  >
                    <option value="Online">Online Sessions</option>
                    <option value="Offline">Offline / Classroom</option>
                    <option value="Hybrid">Hybrid (Best of both)</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </label>

              {/* SECTION: Contact & Guardian */}
              <SectionHeader icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />} title="Contact & Location" />
              <Field label="Guardian Name" value={form.guardianName} onChange={(val) => handleChange('guardianName', val)} placeholder="Parent/Guardian Name" required />
              <Field label="Guardian Phone" type="tel" value={form.guardianPhone} onChange={(val) => handleChange('guardianPhone', val)} placeholder="Emergency Contact" required />

              <TextAreaField 
                label="Full Address" 
                value={form.address} 
                onChange={(val) => handleChange('address', val)} 
                placeholder="Enter your complete residential address..." 
                required 
              />
              <TextAreaField 
                label="Additional Notes" 
                value={form.notes} 
                onChange={(val) => handleChange('notes', val)} 
                placeholder="Learning preferences, specific timing constraints, etc." 
                required={false}
              />

              {/* Submit Section */}
              <div className="md:col-span-2 mt-2 sm:mt-4 pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-indigo-600 text-white font-bold py-3.5 sm:py-4 md:py-5 text-base sm:text-lg hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> Processing Application...</>
                  ) : (
                    <>Submit Application <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6" /></>
                  )}
                </button>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 text-xs sm:text-sm font-medium text-slate-500 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 hidden sm:block" />
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
    <div className="flex items-start gap-3 sm:gap-4 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none">
      <div className="mt-0.5 sm:mt-1 p-1 bg-white/10 rounded-full border border-white/10 shrink-0">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">{title}</h3>
        <p className="text-sm sm:text-base text-indigo-100/80 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="md:col-span-2 flex items-center gap-3 sm:gap-4 border-b border-slate-100 pb-2 sm:pb-3 mb-1 sm:mb-2 mt-4 sm:mt-6 first:mt-0">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
        {icon}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h2>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block group w-full">
      <span className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 sm:px-5 py-3 sm:py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder = '', required = false }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="md:col-span-2 block group w-full">
      <span className="flex items-baseline justify-between text-xs sm:text-sm font-bold text-slate-700 mb-1.5 sm:mb-2">
        <span>{label} {required && <span className="text-rose-500">*</span>}</span>
        {!required && <span className="text-[10px] sm:text-xs text-slate-400 font-normal normal-case tracking-normal">(Optional)</span>}
      </span>
      <textarea
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 min-h-[100px] outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}