'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useUi } from '@/components/providers/ui-provider';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Loader2,
  Flag,
  Target,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
interface QuizOption {
  id: number;
  text: string;
}

interface QuizQuestion {
  id: number;
  text: string;
  image_url?: string | null;
  marks_positive: number;
  marks_negative: number;
  options: QuizOption[];
}

interface QuizData {
  id: number;
  resource_title?: string;
  time_limit_minutes: number;
  passing_score_percentage: number;
  questions: QuizQuestion[];
}

export default function QuizAttemptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <QuizEngine />
    </Suspense>
  );
}

function QuizEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert, showConfirm } = useUi();
  const quizId = searchParams.get('id');

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!quizId) {
      setError('No quiz ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/public/quizzes/${quizId}/`);
        setQuiz(data);
        if (data.time_limit_minutes > 0) {
          setTimeLeft(data.time_limit_minutes * 60);
        }
      } catch (err) {
        setError('Could not load the quiz. It may be unavailable or deleted.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer Countdown Logic
  useEffect(() => {
    if (!hasStarted || timeLeft === null || timeLeft <= 0 || isSubmitting || isFinished) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          clearInterval(timerId);
          forceSubmit(); // Time's up! Force submission.
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [hasStarted, timeLeft, isSubmitting, isFinished]);

  const handleStartQuiz = async () => {
    const confirmed = await showConfirm({
      title: 'Ready to begin?',
      message: `Once started, the timer cannot be paused. Make sure you have a stable connection and enough time to complete this assessment.`,
      confirmText: 'Yes, Start Now',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      setHasStarted(true);
    }
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // --- THESE ARE THE MISSING FUNCTIONS ---
  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  // ---------------------------------------

  const forceSubmit = async () => {
    await showAlert({
      title: "Time's Up!",
      message: "Your time has expired. Your answers are being submitted automatically.",
      variant: 'warning'
    });
    executeSubmission();
  };

  const handleManualSubmit = async () => {
    const unanswered = quiz!.questions.length - Object.keys(answers).length;
    
    const confirmed = await showConfirm({
      title: 'Submit Assessment?',
      message: unanswered > 0 
        ? `You still have ${unanswered} unanswered questions. Are you sure you want to submit?`
        : 'You have answered all questions. Ready to submit?',
      confirmText: 'Submit Quiz',
      cancelText: 'Go Back',
      variant: unanswered > 0 ? 'warning' : 'info'
    });

    if (confirmed) {
      executeSubmission();
    }
  };

  const executeSubmission = async () => {
    if (!quiz) return;
    setIsSubmitting(true);

    try {
      const payload = {
        quiz_id: quiz.id,
        answers: Object.entries(answers).map(([qId, oId]) => ({
          question_id: Number(qId),
          option_id: oId,
        })),
      };

      await api.post('/public/quiz-attempts/submit/', payload);
      const response = await api.post('/public/quiz-attempts/submit/', payload)
      router.replace(`/quiz/result?attempt_id=${response.data.id}`)
      setIsFinished(true);
    } catch (err : any) {
        const errorMessage = err.response?.data?.error || 'There was a problem submitting your quiz. Sorry for inconvenience.'
      await showAlert({
        title: 'Submission Failed',
        message: errorMessage,
        variant: 'error'
      });
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Environment...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] border border-rose-100 shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Quiz</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button onClick={() => router.back()} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Intro / Pre-start Screen ---
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-2xl w-full">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{quiz.resource_title || 'Assessment'}</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Please read the instructions carefully before starting. Make sure you are in a quiet environment and have a stable internet connection.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <Clock className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">Time Limit</p>
              <p className="text-xl font-bold text-slate-900">{quiz.time_limit_minutes} Mins</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <Target className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">Passing Score</p>
              <p className="text-xl font-bold text-slate-900">{quiz.passing_score_percentage}%</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => router.back()} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              Go Back
            </button>
            <button onClick={handleStartQuiz} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              Begin Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Success / Finished Screen ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-lg w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Assessment Submitted!</h2>
          <p className="text-slate-500 font-medium mb-8">Your responses have been securely saved and graded.</p>
          <button onClick={() => router.push('/courses')} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  // --- Single Screen Side-by-Side Layout ---
  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="hidden sm:block border-l border-slate-200 h-8 mr-2"></div>
            <h1 className="font-bold text-slate-900 line-clamp-1">{quiz.resource_title || 'Assessment'}</h1>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono tracking-tight",
                timeLeft < 60 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-indigo-50 text-indigo-700"
              )}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            <button 
              onClick={handleManualSubmit} 
              disabled={isSubmitting}
              className="hidden md:flex px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish Test'}
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Split Screen Layout */}
      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Question Content */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12 overflow-y-auto bg-slate-50 flex flex-col custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">+{currentQuestion.marks_positive} Marks</span>
              {currentQuestion.marks_negative > 0 && (
                <span className="px-3 py-1 bg-rose-100/50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">-{currentQuestion.marks_negative} Penalty</span>
              )}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-medium text-slate-900 leading-snug mb-8">
            {currentQuestion.text}
          </h2>

          {currentQuestion.image_url && (
            <div className="mt-auto rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img src={currentQuestion.image_url} alt="Question reference" className="w-full h-auto max-h-[40vh] object-contain p-4" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Options & Controls */}
        <div className="w-full lg:w-1/2 bg-white border-l border-slate-200 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          
          {/* Options Scrollable Area */}
          <div className="flex-grow p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Select your answer</h3>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-200 flex items-center justify-between group",
                      isSelected 
                        ? "bg-indigo-50/50 border-indigo-600 text-indigo-900 shadow-md shadow-indigo-600/10" 
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-lg font-medium pr-4">{option.text}</span>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-indigo-300"
                    )}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Nav Controls pinned to bottom of right column */}
          <div className="p-6 md:px-10 md:py-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>

            {!isLastQuestion ? (
              <button 
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all",
                  isAnswered 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95" 
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                )}
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Flag className="w-5 h-5" /> Submit</>}
              </button>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}